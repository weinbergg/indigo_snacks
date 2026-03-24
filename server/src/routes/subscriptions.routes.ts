import { Router } from 'express';
import { createSubscriptionController } from '../controllers/subscription.controller';

export const subscriptionsRouter = Router();

subscriptionsRouter.post('/', createSubscriptionController);
