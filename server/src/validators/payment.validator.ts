import { z } from 'zod';
import { sanitizePayload } from '../utils/sanitize';

const orderPaymentParamsSchema = z.object({
  orderNumber: z.string().trim().min(4).max(80)
});

const ozonWebhookSchema = z
  .object({
    amount: z.union([z.number(), z.string()]),
    currencyCode: z.string().trim().min(1),
    operationType: z.string().trim().min(1),
    requestSign: z.string().trim().min(16),
    status: z.string().trim().min(1),
    errorCode: z.union([z.number(), z.string()]).optional(),
    errorMessage: z.string().trim().optional(),
    extData: z.unknown().optional(),
    extOrderID: z.string().trim().optional(),
    extTransactionId: z.string().trim().optional(),
    extTransactionID: z.string().trim().optional(),
    orderID: z.string().trim().optional(),
    paymentMethod: z.string().trim().optional(),
    paymentTime: z.string().trim().optional(),
    testMode: z.union([z.number(), z.string()]).optional(),
    transactionID: z.union([z.number(), z.string()]).optional(),
    transactionUid: z.string().trim().optional(),
    transactionUID: z.string().trim().optional()
  })
  .passthrough();

export function parseOrderPaymentParams(input: unknown) {
  return orderPaymentParamsSchema.parse(sanitizePayload(input));
}

export function parseOzonWebhookInput(input: unknown) {
  return ozonWebhookSchema.parse(sanitizePayload(input));
}
