import type { Request, Response } from 'express';
import { asyncHandler } from '../utils/async-handler';
import { createOrder } from '../services/order.service';
import { parseOrderInput } from '../validators/order.validator';

export const createOrderController = asyncHandler(async (request: Request, response: Response) => {
  const payload = parseOrderInput(request.body);
  const result = await createOrder(payload);

  response.status(201).json({
    success: true,
    data: result
  });
});
