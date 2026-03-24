import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { apiRouter } from './routes';
import { env } from './config/env';
import { errorHandler } from './middleware/error-handler';
import { notFoundHandler } from './middleware/not-found';

export function createApp() {
  const app = express();

  app.set('trust proxy', 1);
  app.use(
    helmet({
      crossOriginResourcePolicy: false
    })
  );
  app.use(express.json({ limit: '50kb' }));

  if (env.CLIENT_ORIGIN) {
    app.use(
      cors({
        origin: env.CLIENT_ORIGIN
      })
    );
  }

  app.use(
    '/api',
    rateLimit({
      windowMs: env.RATE_LIMIT_WINDOW_MS,
      max: env.RATE_LIMIT_MAX,
      standardHeaders: true,
      legacyHeaders: false
    })
  );
  app.use('/api', apiRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
