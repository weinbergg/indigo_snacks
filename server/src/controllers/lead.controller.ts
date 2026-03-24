import type { Request, Response } from 'express';
import { createLead } from '../services/lead.service';
import { asyncHandler } from '../utils/async-handler';
import { parseLeadInput } from '../validators/lead.validator';

export const createLeadController = asyncHandler(async (request: Request, response: Response) => {
  const payload = parseLeadInput(request.body);
  const lead = await createLead(payload);

  response.status(201).json({
    success: true,
    data: lead
  });
});
