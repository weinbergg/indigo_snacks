import type { Request, Response } from 'express';
import { asyncHandler } from '../utils/async-handler';
import { calculateDeliveryQuote } from '../services/delivery.service';
import { parseDeliveryCalculationInput } from '../validators/delivery.validator';

export const calculateDeliveryController = asyncHandler(
  async (request: Request, response: Response) => {
    const payload = parseDeliveryCalculationInput(request.body);
    const quote = calculateDeliveryQuote(payload);

    response.json({
      success: true,
      data: quote
    });
  }
);
