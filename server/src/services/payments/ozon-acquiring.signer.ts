import { createHash, timingSafeEqual } from 'node:crypto';
import type { OzonMoney, OzonNotificationPayload, OzonResolvedNotificationPayload } from './ozon-acquiring.types';

function sha256Hex(value: string) {
  return createHash('sha256').update(value, 'utf8').digest('hex');
}

function toSafeBuffer(value: string) {
  return Buffer.from(value.trim().toLowerCase(), 'utf8');
}

function toStringValue(value: number | string | undefined | null) {
  if (value === undefined || value === null) {
    return '';
  }

  return String(value);
}

export function signOzonCreateOrder(input: {
  accessKey: string;
  amount: OzonMoney;
  expiresAt?: string;
  extId: string;
  fiscalizationType?: string;
  paymentAlgorithm: string;
  secretKey: string;
}) {
  return sha256Hex(
    `${input.accessKey}${input.expiresAt ?? ''}${input.extId}${input.fiscalizationType ?? ''}${input.paymentAlgorithm}${input.amount.currencyCode}${input.amount.value}${input.secretKey}`
  );
}

export function signOzonGetOrder(input: {
  accessKey: string;
  extId?: string;
  id?: string;
  secretKey: string;
}) {
  return sha256Hex(
    `${input.id ?? ''}${input.extId ?? ''}${input.accessKey}${input.secretKey}`
  );
}

export function resolveOzonNotificationPayload(
  payload: OzonNotificationPayload
): OzonResolvedNotificationPayload {
  return {
    amount: toStringValue(payload.amount),
    currencyCode: payload.currencyCode,
    errorCode: toStringValue(payload.errorCode) || undefined,
    errorMessage: payload.errorMessage,
    extData: payload.extData,
    extOrderId: payload.extOrderID || undefined,
    extTransactionId: payload.extTransactionID || payload.extTransactionId || undefined,
    operationType: payload.operationType,
    orderId: payload.orderID || undefined,
    paymentMethod: payload.paymentMethod,
    paymentTime: payload.paymentTime,
    requestSign: payload.requestSign,
    status: payload.status,
    testMode: toStringValue(payload.testMode) || undefined,
    transactionId: toStringValue(payload.transactionID) || undefined,
    transactionUid: payload.transactionUID || payload.transactionUid || undefined
  };
}

export function buildOzonNotificationDigest(input: {
  accessKey: string;
  notificationSecretKey: string;
  payload: OzonNotificationPayload;
}) {
  const payload = resolveOzonNotificationPayload(input.payload);

  if (payload.orderId) {
    return [
      input.accessKey,
      payload.orderId,
      payload.transactionId || payload.transactionUid || '',
      payload.extOrderId || '',
      payload.amount,
      payload.currencyCode,
      input.notificationSecretKey
    ].join('|');
  }

  return [
    input.accessKey,
    '',
    '',
    payload.extTransactionId || '',
    payload.amount,
    payload.currencyCode,
    input.notificationSecretKey
  ].join('|');
}

export function verifyOzonNotificationSignature(input: {
  accessKey: string;
  notificationSecretKey: string;
  payload: OzonNotificationPayload;
}) {
  const expected = sha256Hex(buildOzonNotificationDigest(input));
  const actual = input.payload.requestSign;

  const expectedBuffer = toSafeBuffer(expected);
  const actualBuffer = toSafeBuffer(actual);

  if (expectedBuffer.length !== actualBuffer.length) {
    return false;
  }

  return timingSafeEqual(expectedBuffer, actualBuffer);
}
