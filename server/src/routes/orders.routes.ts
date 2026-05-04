import { Router } from 'express';
import { createOrderController } from '../controllers/order.controller';
import { initOzonPaymentController, syncOzonPaymentController } from '../controllers/payment.controller';

export const ordersRouter = Router();

ordersRouter.post('/', createOrderController);
ordersRouter.post('/:orderNumber/payments/ozon/init', initOzonPaymentController);
ordersRouter.post('/:orderNumber/payments/ozon/sync', syncOzonPaymentController);
