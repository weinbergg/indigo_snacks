import { prisma } from '../../db/prisma';
import { env } from '../../config/env';
import { AppError } from '../../utils/errors';
import { createOzonOrder, getOzonOrderStatus } from './ozon-acquiring.client';
import {
  resolveOzonNotificationPayload,
  signOzonCreateOrder,
  signOzonGetOrder,
  verifyOzonNotificationSignature
} from './ozon-acquiring.signer';
import type {
  OzonCreateOrderRequest,
  OzonCreateOrderResponse,
  OzonGetOrderStatusResponse,
  OzonMoney,
  OzonNotificationPayload,
  OzonOrderSnapshot
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

function appendOrderQuery(
  url: string,
  orderNumber: string,
  paymentState?: 'success' | 'failed'
) {
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
    env.OZON_ACQUIRING_FAIL_URL || `${fallbackBaseUrl}/checkout?payment=failed`;
  const baseSuccessUrl =
    env.OZON_ACQUIRING_SUCCESS_URL || `${fallbackBaseUrl}/checkout?payment=success`;

  return {
    failUrl: appendOrderQuery(baseFailUrl, orderNumber, 'failed'),
    notificationUrl: env.OZON_ACQUIRING_NOTIFICATION_URL,
    successUrl: appendOrderQuery(baseSuccessUrl, orderNumber, 'success')
  };
}

function formatOzonMoney(valueKopecks: number): OzonMoney {
  return {
    currencyCode: '643',
    value: String(valueKopecks)
  };
}

function mapOzonOrderStatus(status: string | undefined) {
  switch (status) {
    case 'STATUS_NEW':
      return 'AWAITING_REDIRECT';
    case 'STATUS_PAYMENT_PENDING':
      return 'PROCESSING';
    case 'STATUS_AUTHORIZED':
      return 'AUTHORIZED';
    case 'STATUS_PAID':
      return 'PAID';
    case 'STATUS_PARTITIONAL_REFUND':
    case 'STATUS_REFUNDED':
      return 'REFUNDED';
    case 'STATUS_CANCELED':
    case 'STATUS_PARTITION_CANCELED':
      return 'CANCELED';
    case 'STATUS_DISPUTED':
    case 'STATUS_DISPUTING':
      return 'REVIEW';
    case 'STATUS_EXPIRED':
      return 'FAILED';
    default:
      return 'PENDING';
  }
}

function mapOzonNotificationStatus(status: string) {
  if (status.startsWith('STATUS_')) {
    return mapOzonOrderStatus(status);
  }

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

function buildPaymentNote(
  paymentStatus: string,
  rawStatus?: string,
  errorMessage?: string
) {
  if (errorMessage) {
    return errorMessage;
  }

  switch (paymentStatus) {
    case 'AWAITING_REDIRECT':
      return 'Ссылка на страницу оплаты Ozon Acquiring подготовлена.';
    case 'PROCESSING':
      return 'Ozon Acquiring ожидает завершения оплаты.';
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

function mergePaymentMeta(
  existing: string | null | undefined,
  patch: Record<string, unknown>
) {
  const currentMeta = parsePaymentMeta(existing);
  return JSON.stringify({ ...currentMeta, ...patch });
}

function resolveOzonOrderSnapshot(
  response: OzonCreateOrderResponse | OzonGetOrderStatusResponse
) {
  const nestedItem = response.order?.item;
  if (nestedItem) {
    return nestedItem;
  }

  if ('item' in response && response.item) {
    return response.item;
  }

  if ('status' in response && (response.status || response.id || response.extId)) {
    return {
      extId: response.extId,
      id: response.id,
      isTestMode: response.isTestMode,
      remainingAmount: response.remainingAmount,
      status: response.status
    } satisfies OzonOrderSnapshot;
  }

  return undefined;
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

function buildOzonCreateOrderPayload(input: {
  accessKey: string;
  ipAddress?: string;
  order: Awaited<ReturnType<typeof getOrderForPayment>>;
  secretKey: string;
}) {
  const extId = input.order.orderNumber;
  const amount = formatOzonMoney(input.order.totalKopecks);
  const expiresAt = new Date(
    Date.now() + env.OZON_ACQUIRING_PAYMENT_TTL_SECONDS * 1000
  ).toISOString();
  const urls = getOzonReturnUrls(input.order.orderNumber);
  const fiscalizationType = 'FISCAL_TYPE_SINGLE' as const;
  const paymentAlgorithm = 'PAY_ALGO_SMS' as const;

  const payload: OzonCreateOrderRequest = {
    accessKey: input.accessKey,
    amount,
    enableFiscalization: false,
    expiresAt,
    extData: {
      orderNumber: input.order.orderNumber,
      paymentMethod: input.order.paymentMethod,
      source: 'indigo-snacks'
    },
    extId,
    failUrl: urls.failUrl,
    fiscalizationType,
    items: input.order.items.map((item) => ({
      extId: item.id,
      name: `${item.productName} ${item.variantLabel}`,
      price: formatOzonMoney(item.unitPriceKopecks),
      quantity: item.quantity,
      vat: 'VAT_UNSPECIFIED'
    })),
    mode: 'MODE_FULL',
    notificationUrl: urls.notificationUrl,
    paymentAlgorithm,
    receiptEmail: input.order.email || undefined,
    requestSign: signOzonCreateOrder({
      accessKey: input.accessKey,
      amount,
      expiresAt,
      extId,
      fiscalizationType,
      paymentAlgorithm,
      secretKey: input.secretKey
    }),
    successUrl: urls.successUrl
  };

  return { payload, paymentExtId: extId };
}

function getOzonStatusLookup(order: Awaited<ReturnType<typeof getOrderForPayment>>) {
  if (order.paymentProviderId) {
    return {
      extId: undefined,
      id: order.paymentProviderId
    };
  }

  if (order.paymentExternalId) {
    return {
      extId: order.paymentExternalId,
      id: undefined
    };
  }

  return {
    extId: order.orderNumber,
    id: undefined
  };
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

  const { payload, paymentExtId } = buildOzonCreateOrderPayload({
    accessKey: config.accessKey,
    ipAddress,
    order,
    secretKey: config.secretKey
  });
  const response = await createOzonOrder(payload);
  const orderSnapshot = resolveOzonOrderSnapshot(response);
  const paymentId = orderSnapshot?.id || response.paymentDetails?.paymentId;

  if (!paymentId) {
    throw new AppError('Ozon Acquiring не вернул идентификатор заказа.', 502, response);
  }

  const rawStatus = orderSnapshot?.status || response.paymentDetails?.status;
  const paymentStatus = rawStatus ? mapOzonOrderStatus(rawStatus) : 'AWAITING_REDIRECT';
  const redirectUrl =
    orderSnapshot?.payLink || response.paymentDetails?.sbp?.payload || null;
  const paymentNote = buildPaymentNote(paymentStatus, rawStatus);
  const paymentMetaJson = mergePaymentMeta(order.paymentMetaJson, {
    ozon: {
      createdAt: new Date().toISOString(),
      createOrderResponse: response,
      isTestMode: orderSnapshot?.isTestMode ?? env.OZON_ACQUIRING_TEST_MODE,
      orderNumber: orderSnapshot?.number || null,
      paymentAlgorithm: orderSnapshot?.paymentAlgorithm || payload.paymentAlgorithm,
      payLink: redirectUrl,
      paymentType: response.paymentDetails?.type || 'PAY_TYPE_BANK_CARD'
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
    provider: 'OZON_ACQUIRING' as const,
    rawStatus,
    redirectUrl,
    reused: false
  };
}

export async function syncOzonPaymentForOrder(orderNumber: string) {
  const config = requireOzonPaymentConfig();
  const order = await getOrderForPayment(orderNumber);
  const lookup = getOzonStatusLookup(order);

  if (!lookup.id && !lookup.extId) {
    throw new AppError('Для заказа еще не создана попытка оплаты Ozon Acquiring.', 409);
  }

  const response = await getOzonOrderStatus({
    accessKey: config.accessKey,
    extId: lookup.extId,
    id: lookup.id,
    requestSign: signOzonGetOrder({
      accessKey: config.accessKey,
      extId: lookup.extId,
      id: lookup.id,
      secretKey: config.secretKey
    })
  });

  const orderSnapshot = resolveOzonOrderSnapshot(response);
  const rawStatus = orderSnapshot?.status || response.status;
  const paymentStatus = rawStatus ? mapOzonOrderStatus(rawStatus) : order.paymentStatus;
  const paymentNote = buildPaymentNote(paymentStatus, rawStatus);
  const paymentMetaJson = mergePaymentMeta(order.paymentMetaJson, {
    ozon: {
      ...(parsePaymentMeta(order.paymentMetaJson).ozon as Record<string, unknown> | undefined),
      lastSyncAt: new Date().toISOString(),
      orderStatusResponse: response
    }
  });

  const nextPaymentId = orderSnapshot?.id || order.paymentProviderId;
  const nextRedirectUrl = orderSnapshot?.payLink || order.paymentRedirectUrl;

  await prisma.order.update({
    where: { id: order.id },
    data: {
      paymentLastError:
        paymentStatus === 'FAILED' || paymentStatus === 'CANCELED' ? paymentNote : null,
      paymentMetaJson,
      paymentNote,
      paymentProviderId: nextPaymentId,
      paymentRawStatus: rawStatus,
      paymentRedirectUrl: nextRedirectUrl,
      paymentStatus
    }
  });

  return {
    orderNumber: order.orderNumber,
    paymentId: nextPaymentId || order.paymentExternalId || order.orderNumber,
    paymentStatus,
    provider: 'OZON_ACQUIRING' as const,
    rawStatus,
    transactionUid: null
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
      ? await prisma.order.findFirst({
          where: {
            OR: [
              { orderNumber: resolvedPayload.extOrderId },
              { paymentExternalId: resolvedPayload.extOrderId }
            ]
          }
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
      paymentProviderId: order.paymentProviderId || resolvedPayload.orderId || undefined,
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
