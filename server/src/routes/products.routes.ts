import { Router } from 'express';
import { getProductsController } from '../controllers/product.controller';

export const productsRouter = Router();

productsRouter.get('/', getProductsController);
