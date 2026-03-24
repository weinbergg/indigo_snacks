import type { Request, Response } from 'express';
import { asyncHandler } from '../utils/async-handler';
import { listProducts } from '../services/product.service';

export const getProductsController = asyncHandler(async (_request: Request, response: Response) => {
  const products = await listProducts();

  response.json({
    success: true,
    data: products
  });
});
