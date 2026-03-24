import type { Request, Response } from 'express';
import { asyncHandler } from '../utils/async-handler';
import { createSubscriptionRequest } from '../services/subscription.service';
import { parseSubscriptionInput } from '../validators/subscription.validator';

export const createSubscriptionController = asyncHandler(
  async (request: Request, response: Response) => {
    const payload = parseSubscriptionInput(request.body);
    const result = await createSubscriptionRequest(payload);

    response.status(201).json({
      success: true,
      data: result
    });
  }
);
