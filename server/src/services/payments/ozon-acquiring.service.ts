import { prisma } from '../../db/prisma';
import { env } from '../../config/env';
import { AppError } from '../../utils/errors';
import {
  createOzonPayment,
  getOzonPaymentDetails
} from './ozon-acquiring.client';
import {
  resolveOzonNotificationPayload,
  signOzonCreatePayment,
  signOzonGetOrCancelPayment,
  verifyOzonNotificationSignature
} from './ozon-acquiring.signer';
import type {
  OzonCreatePaymentRequest,
  OzonGetPaymentDetailsResponse,
  OzonMoney,
  OzonNotificationPayload
} from './ozon-acquiring.types';

const ACTIVE_PAYMENT_STATUSES = new Set([
  'PENDING',
  'AWAITING_REDIRECT',
  'PROCESSING',
  'AUTHORIZED'
]);

function requireOzonPaymentConfig() {
  if (!env.OZON_ACQUIRING_ENABLED) {
    throw new AppError('Ozon Acquiring выключен в конфигурации.', 503);
  }

  if (!env.OZON_ACQUIRING_ACCESS_KEY || !env.OZON_ACQUIRING_SECRET_KEY) {
    throw new AppError('Не заполнены ключи Ozon Acquiring.', 503);
  }

  return {
    accessKey: env.OZON_ACQUIRING_ACCESS_KEY,
    secretKey: env.OZON_ACQUIRING_SECRET_KEY
  };
}

function requireOzonWebhookConfig() {
  const paymentConfig = requireOzonPaymentConfig();

  if (!env.OZON_ACQUIRING_NOTIFICATION_SECRET_KEY) {
    throw new AppError('Не заполнен notification secret для Ozon Acquiring.', 503);
  }

  return {
    ...paymentConfig,
    notificationSecretKey: env.OZON_ACQUIRING_NOTIFICATION_SECRET_KEY
  };
}

function getOrderFallbackBaseUrl() {
  return env.CLIENT_ORIGIN || 'http://localhost:5173';
}

function appendOrderQuery(url: string, orderNumber: string, paymentState?: 'success' | 'failed') {
  const fallbackBaseUrl = getOrderFallbackBaseUrl();

  try {
    const parsed = new URL(url, fallbackBaseUrl);
    parsed.searchParams.set('order', orderNumber);
    if (paymentState) {
      parsed.searchParams.set('payment', paymentState);
    }

    if (/^https?:\/\//i.test(url)) {
      return parsed.toString();
    }

    return `${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    const separator = url.includes('?') ? '&' : '?';
    const orderQuery = `order=${encodeURIComponent(orderNumber)}`;
    const paymentQuery = paymentState ? `&payment=${paymentState}` : '';
    return `${url}${separator}${orderQuery}${paymentQuery}`;
  }
}

function getOzonReturnUrls(orderNumber: string) {
  const fallbackBaseUrl = getOrderFallbackBaseUrl();
  const baseFailUrl =
    env.OZON_ACQUIRING_FAIL_URL ||
    `${fallbackBaseUrl}/checkout?payment=failed`;
  const baseRedirectUrl =
    env.OZON_ACQUIRING_REDIRECT_URL ||
    `${fallbackBaseUrl}/checkout`;
  const baseSuccessUrl =
    env.OZON_ACQUIRING_SUCCESS_URL ||
    `${fallbackBaseUrl}/checkout?payment=success`;

  return {
    failUrl: appendOrderQuery(baseFailUrl, orderNumber, 'failed'),
    notificationUrl: env.OZON_ACQUIRING_NOTIFICATION_URL,
    redirectUrl: appendOrderQuery(baseRedirectUrl, orderNumber),
    successUrl: appendOrderQuery(baseSuccessUrl, orderNumber, 'success')
  };
}

function formatOzonMoney(valueKopecks: number): OzonMoney {
  return {
    currencyCode: '643',
    value: String(valueKopecks)
  };
}

function buildOzonPaymentExtId(orderNumber: string) {
  return `${orderNumber}-ozon-${Date.now()}`;
}

function mapOzonOperationStatus(status: string | undefined) {
  switch (status) {
    case 'PAYMENT_NEW':
      return 'AWAITING_REDIRECT';
    case 'PAYMENT_PROCESSING':
      return 'PROCESSING';
    case 'PAYMENT_AUTHORIZED':
      return 'AUTHORIZED';
    case 'PAYMENT_CONFIRMED':
      return 'PAID';
    case 'PAYMENT_REJECTED':
      return 'FAILED';
    case 'PAYMENT_CANCELED':
    case 'CANCEL_SUCCESS':
      return 'CANCELED';
    case 'REFUND_SUCCESS':
      return 'REFUNDED';
    case 'REFUND_FAILED':
    case 'CANCEL_FAILED':
      return 'FAILED';
    case 'CHARGEBACK_SUCCESS':
    case 'SBP_DISPUTE_SUCCESS':
      return 'REVIEW';
    case 'REVERT_CHARGEBACK_SUCCESS':
      return 'PAID';
    default:
      return 'PENDING';
  }
}

function mapOzonNotificationStatus(status: string) {
  switch (status) {
    case 'Completed':
      return 'PAID';
    case 'Authorized':
      return 'AUTHORIZED';
    case 'Rejected':
      return 'FAILED';
    default:
      return 'PENDING';
  }
}

function buildPaymentNote(paymentStatus: string, rawStatus?: string, errorMessage?: string) {
  if (errorMessage) {
    return errorMessage;
  }

  switch (paymentStatus) {
    case 'AWAITING_REDIRECT':
      return 'Ссылка на оплату Ozon Acquiring подготовлена.';
    case 'PROCESSING':
      return 'Ozon Acquiring обрабатывает платёж.';
    case 'AUTHORIZED':
      return 'Платёж авторизован в Ozon Acquiring.';
    case 'PAID':
      return 'Оплата подтверждена через Ozon Acquiring.';
    case 'CANCELED':
      return 'Попытка оплаты отменена в Ozon Acquiring.';
    case 'REFUNDED':
      return 'Платёж возвращён через Ozon Acquiring.';
    case 'FAILED':
      return rawStatus
        ? `Ozon Acquiring вернул статус ${rawStatus}.`
        : 'Платёж не был подтверждён Ozon Acquiring.';
    case 'REVIEW':
      return 'Платёж требует дополнительной проверки со стороны Ozon Acquiring.';
    default:
      return 'Статус оплаты ожидает обновления от Ozon Acquiring.';
  }
}

function parsePaymentMeta(value: string | null | undefined) {
  if (!value) {
    return {} as Record<string, unknown>;
  }

  try {
    const parsed = JSON.parse(value) as Record<string, unknown>;
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function mergePaymentMeta(existing: string | null | undefined, patch: Record<string, unknown>) {
  const currentMeta = parsePaymentMeta(existing);
  return JSON.stringify({ ...currentMeta, ...patch });
}

function pickLatestOzonOperation(response: OzonGetPaymentDetailsResponse) {
  if (!response.items?.length) {
    return undefined;
  }

  return [...response.items].sort((left, right) => {
    const leftTime = left.operationTime ? new Date(left.operationTime).getTime() : 0;
    const rightTime = right.operationTime ? new Date(right.operationTime).getTime() : 0;
    return rightTime - leftTime;
  })[0];
}

async function getOrderForPayment(orderNumber: string) {
  const order = await prisma.order.findUnique({
    where: { orderNumber },
    include: {
      items: true
    }
  });

  if (!order) {
    throw new AppError('Заказ не найден.', 404);
  }

  return order;
}

function buildOzonCreatePaymentPayload(input: {
  accessKey: string;
  ipAddress?: string;
  orderNumber: string;
  secretKey: string;
  totalKopecks: number;
}) {
  const paymentExtId = buildOzonPaymentExtId(input.orderNumber);
  const amount = formatOzonMoney(input.totalKopecks);
  const urls = getOzonReturnUrls(input.orderNumber);

  const payload: OzonCreatePaymentRequest = {
    accessKey: input.accessKey,
    amount,
    extId: paymentExtId,
    notificationUrl: urls.notificationUrl,
    order: {
      amount,
      extId: input.orderNumber,
      expiresAt: new Date(
        Date.now() + env.OZON_ACQUIRING_PAYMENT_TTL_SECONDS * 1000
      ).toISOString(),
      failUrl: urls.failUrl,
      notificationUrl: urls.notificationUrl,
      successUrl: urls.successUrl
    },
    payType: 'SBP',
    redirectUrl: urls.redirectUrl,
    requestSign: signOzonCreatePayment({
      accessKey: input.accessKey,
      extId: paymentExtId,
      secretKey: input.secretKey
    }),
    ttl: env.OZON_ACQUIRING_PAYMENT_TTL_SECONDS,
    userInfo: input.ipAddress
      ? {
          ipAddress: input.ipAddress
        }
      : undefined
  };

  return { payload, paymentExtId };
}

export async function initOzonPaymentForOrder(orderNumber: string, ipAddress?: string) {
  const config = requireOzonPaymentConfig();
  const order = await getOrderForPayment(orderNumber);

  if (order.paymentStatus === 'PAID') {
    throw new AppError('Заказ уже оплачен.', 409);
  }

  if (
    order.paymentProvider === 'OZON_ACQUIRING' &&
    order.paymentProviderId &&
    order.paymentRedirectUrl &&
    ACTIVE_PAYMENT_STATUSES.has(order.paymentStatus)
  ) {
    return {
      orderNumber: order.orderNumber,
      paymentExtId: order.paymentExternalId,
      paymentId: order.paymentProviderId,
      paymentStatus: order.paymentStatus,
      provider: 'OZON_ACQUIRING',
      rawStatus: order.paymentRawStatus,
      redirectUrl: order.paymentRedirectUrl,
      reused: true
    };
  }

  const { payload, paymentExtId } = buildOzonCreatePaymentPayload({
    accessKey: config.accessKey,
    ipAddress,
    orderNumber: order.orderNumber,
    secretKey: config.secretKey,
    totalKopecks: order.totalKopecks
  });
  const response = await createOzonPayment(payload);

  const paymentId = response.paymentDetails?.paymentId;
  if (!paymentId) {
    throw new AppError('Ozon Acquiring не вернул paymentId.', 502, response);
  }

  const rawStatus = response.paymentDetails?.status;
  const paymentStatus = rawStatus ? mapOzonOperationStatus(rawStatus) : 'AWAITING_REDIRECT';
  const redirectUrl = response.order?.item?.payLink || response.paymentDetails?.sbp?.payload || null;
  const paymentNote = buildPaymentNote(paymentStatus, rawStatus);
  const paymentMetaJson = mergePaymentMeta(order.paymentMetaJson, {
    ozon: {
      createdAt: new Date().toISOString(),
      isTestMode: env.OZON_ACQUIRING_TEST_MODE,
      orderId: response.order?.item?.id || null,
      orderStatus: response.order?.item?.status || null,
      payLink: response.order?.item?.payLink || null,
      paymentType: response.paymentDetails?.type || null,
      sbpPayload: response.paymentDetails?.sbp?.payload || null
    }
  });

  await prisma.order.update({
    where: { id: order.id },
    data: {
      paymentExternalId: paymentExtId,
      paymentLastError: null,
      paymentMetaJson,
      paymentNote,
      paymentProvider: 'OZON_ACQUIRING',
      paymentProviderId: paymentId,
      paymentRawStatus: rawStatus,
      paymentRedirectUrl: redirectUrl,
      paymentStatus
    }
  });

  return {
    orderNumber: order.orderNumber,
    paymentExtId,
    paymentId,
    paymentStatus,
    provider: 'OZON_ACQUIRING',
    rawStatus,
    redirectUrl,
    reused: false
  };
}

export async function syncOzonPaymentForOrder(orderNumber: string) {
  const config = requireOzonPaymentConfig();
  const order = await getOrderForPayment(orderNumber);

  if (!order.paymentProviderId) {
    throw new AppError('Для заказа еще не создана попытка оплаты Ozon Acquiring.', 409);
  }

  const response = await getOzonPaymentDetails({
    accessKey: config.accessKey,
    id: order.paymentProviderId,
    requestSign: signOzonGetOrCancelPayment({
      accessKey: config.accessKey,
      id: order.paymentProviderId,
      secretKey: config.secretKey
    })
  });

  const latestOperation = pickLatestOzonOperation(response);
  const rawStatus = latestOperation?.status;
  const paymentStatus = rawStatus ? mapOzonOperationStatus(rawStatus) : order.paymentStatus;
  const paymentNote = buildPaymentNote(paymentStatus, rawStatus);
  const paymentMetaJson = mergePaymentMeta(order.paymentMetaJson, {
    ozon: {
      ...(parsePaymentMeta(order.paymentMetaJson).ozon as Record<string, unknown> | undefined),
      lastSyncAt: new Date().toISOString(),
      latestOperation: latestOperation || null
    }
  });

  await prisma.order.update({
    where: { id: order.id },
    data: {
      paymentLastError: paymentStatus === 'FAILED' ? paymentNote : null,
      paymentMetaJson,
      paymentNote,
      paymentRawStatus: rawStatus,
      paymentStatus
    }
  });

  return {
    orderNumber: order.orderNumber,
    paymentId: order.paymentProviderId,
    paymentStatus,
    provider: 'OZON_ACQUIRING',
    rawStatus,
    transactionUid: latestOperation?.transactionUid
  };
}

export async function handleOzonWebhook(payload: OzonNotificationPayload) {
  const config = requireOzonWebhookConfig();

  if (
    !verifyOzonNotificationSignature({
      accessKey: config.accessKey,
      notificationSecretKey: config.notificationSecretKey,
      payload
    })
  ) {
    throw new AppError('Неверная подпись уведомления Ozon Acquiring.', 400);
  }

  const resolvedPayload = resolveOzonNotificationPayload(payload);
  const order =
    (resolvedPayload.extOrderId
      ? await prisma.order.findUnique({
          where: { orderNumber: resolvedPayload.extOrderId }
        })
      : null) ||
    (resolvedPayload.extTransactionId
      ? await prisma.order.findFirst({
          where: { paymentExternalId: resolvedPayload.extTransactionId }
        })
      : null);

  if (!order) {
    throw new AppError('Не удалось сопоставить уведомление Ozon с заказом.', 404, {
      extOrderId: resolvedPayload.extOrderId,
      extTransactionId: resolvedPayload.extTransactionId
    });
  }

  const paymentStatus = mapOzonNotificationStatus(resolvedPayload.status);
  const paymentNote = buildPaymentNote(
    paymentStatus,
    resolvedPayload.status,
    resolvedPayload.errorMessage
  );
  const paymentMetaJson = mergePaymentMeta(order.paymentMetaJson, {
    ozon: {
      ...(parsePaymentMeta(order.paymentMetaJson).ozon as Record<string, unknown> | undefined),
      lastWebhookAt: new Date().toISOString(),
      lastWebhookPayload: resolvedPayload
    }
  });

  await prisma.order.update({
    where: { id: order.id },
    data: {
      paymentLastError: resolvedPayload.errorMessage || null,
      paymentLastWebhookAt: new Date(),
      paymentMetaJson,
      paymentNote,
      paymentProvider: 'OZON_ACQUIRING',
      paymentRawStatus: resolvedPayload.status,
      paymentStatus
    }
  });

  return {
    orderNumber: order.orderNumber,
    paymentStatus,
    rawStatus: resolvedPayload.status
  };
}
