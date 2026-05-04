import { Router } from 'express';
import { leadsRouter } from './leads.routes';
import { ordersRouter } from './orders.routes';
import { paymentsRouter } from './payments.routes';
import { productsRouter } from './products.routes';
import { subscriptionsRouter } from './subscriptions.routes';
import { deliveryRouter } from './delivery.routes';

export const apiRouter = Router();

apiRouter.get('/healthz', (_request, response) => {
  response.json({
    success: true,
    data: { status: 'ok' }
  });
});

apiRouter.use('/products', productsRouter);
apiRouter.use('/leads', leadsRouter);
apiRouter.use('/orders', ordersRouter);
apiRouter.use('/payments', paymentsRouter);
apiRouter.use('/subscriptions', subscriptionsRouter);
apiRouter.use('/delivery', deliveryRouter);
