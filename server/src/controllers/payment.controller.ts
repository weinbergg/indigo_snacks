import type { Request, Response } from 'express';
import { asyncHandler } from '../utils/async-handler';
import { handleOzonWebhook, initOzonPaymentForOrder, syncOzonPaymentForOrder } from '../services/payments/ozon-acquiring.service';
import { parseOrderPaymentParams, parseOzonWebhookInput } from '../validators/payment.validator';

export const initOzonPaymentController = asyncHandler(async (request: Request, response: Response) => {
  const { orderNumber } = parseOrderPaymentParams(request.params);
  const result = await initOzonPaymentForOrder(orderNumber, request.ip);

  response.status(200).json({
    success: true,
    data: result
  });
});

export const syncOzonPaymentController = asyncHandler(async (request: Request, response: Response) => {
  const { orderNumber } = parseOrderPaymentParams(request.params);
  const result = await syncOzonPaymentForOrder(orderNumber);

  response.status(200).json({
    success: true,
    data: result
  });
});

export const ozonWebhookController = asyncHandler(async (request: Request, response: Response) => {
  const payload = parseOzonWebhookInput(request.body);
  const result = await handleOzonWebhook(payload);

  response.status(200).json({
    success: true,
    data: {
      accepted: true,
      ...result
    }
  });
});
