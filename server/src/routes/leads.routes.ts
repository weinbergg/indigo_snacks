import { Router } from 'express';
import { createLeadController } from '../controllers/lead.controller';

export const leadsRouter = Router();

leadsRouter.post('/', createLeadController);
