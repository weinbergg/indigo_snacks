import { Router } from 'express';
import { ozonWebhookController } from '../controllers/payment.controller';

export const paymentsRouter = Router();

paymentsRouter.post('/ozon/webhook', ozonWebhookController);
