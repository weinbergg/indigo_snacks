import { Router } from 'express';
import { calculateDeliveryController } from '../controllers/delivery.controller';

export const deliveryRouter = Router();

deliveryRouter.post('/calculate', calculateDeliveryController);
