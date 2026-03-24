import { Router } from 'express';
import { createOrderController } from '../controllers/order.controller';

export const ordersRouter = Router();

ordersRouter.post('/', createOrderController);
