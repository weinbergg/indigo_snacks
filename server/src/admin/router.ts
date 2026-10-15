import { Router } from 'express';
import express from 'express';
import rateLimit from 'express-rate-limit';
import { env } from '../config/env';
import { listAdminVariants, updateVariantPrices } from '../services/product.service';
import {
  clearAdminSession,
  hasAdminSession,
  isAdminConfigured,
  setAdminSession,
  verifyAdminPassword
} from './session';
import { renderDisabledPage, renderLoginPage, renderPricesPage } from './html';

function sendHtml(response: express.Response, status: number, html: string) {
  response.status(status).type('html').send(html);
}

export function createAdminRouter() {
  const router = Router();

  router.use(express.urlencoded({ extended: false, limit: '20kb' }));

  const loginLimiter = rateLimit({
    windowMs: env.RATE_LIMIT_WINDOW_MS,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false
  });

  router.get('/', async (request, response, next) => {
    try {
      if (!isAdminConfigured()) {
        sendHtml(response, 503, renderDisabledPage());
        return;
      }

      if (!hasAdminSession(request)) {
        sendHtml(response, 200, renderLoginPage());
        return;
      }

      const variants = await listAdminVariants();
      sendHtml(response, 200, renderPricesPage(variants));
    } catch (error) {
      next(error);
    }
  });

  router.post('/login', loginLimiter, (request, response) => {
    if (!isAdminConfigured()) {
      sendHtml(response, 503, renderDisabledPage());
      return;
    }

    const password = typeof request.body?.password === 'string' ? request.body.password : '';
    if (!verifyAdminPassword(password)) {
      sendHtml(response, 401, renderLoginPage('Неверный пароль.'));
      return;
    }

    setAdminSession(response, request);
    response.redirect(303, '/admin');
  });

  router.post('/logout', (request, response) => {
    clearAdminSession(response, request);
    response.redirect(303, '/admin');
  });

  router.post('/prices', async (request, response, next) => {
    try {
      if (!isAdminConfigured()) {
        sendHtml(response, 503, renderDisabledPage());
        return;
      }

      if (!hasAdminSession(request)) {
        sendHtml(response, 401, renderLoginPage('Сначала войдите в админку.'));
        return;
      }

      const skus = request.body?.sku;
      const prices = request.body?.priceRubles;
      const skuList = Array.isArray(skus) ? skus : skus ? [skus] : [];
      const priceList = Array.isArray(prices) ? prices : prices ? [prices] : [];

      if (skuList.length === 0 || skuList.length !== priceList.length) {
        const variants = await listAdminVariants();
        sendHtml(response, 400, renderPricesPage(variants, 'Не удалось прочитать форму. Попробуйте ещё раз.'));
        return;
      }

      const updates = skuList.map((sku, index) => {
        const rubles = Number(String(priceList[index]).replace(',', '.'));
        if (!Number.isFinite(rubles) || rubles < 1 || rubles > 100000) {
          throw new Error('INVALID_PRICE');
        }

        return {
          sku: String(sku),
          priceKopecks: Math.round(rubles * 100)
        };
      });

      await updateVariantPrices(updates);
      const variants = await listAdminVariants();
      sendHtml(response, 200, renderPricesPage(variants, 'Цены сохранены.'));
    } catch (error) {
      if (error instanceof Error && error.message === 'INVALID_PRICE') {
        try {
          const variants = await listAdminVariants();
          sendHtml(response, 400, renderPricesPage(variants, 'Цена должна быть числом от 1 до 100 000 ₽.'));
          return;
        } catch (innerError) {
          next(innerError);
          return;
        }
      }

      next(error);
    }
  });

  return router;
}
