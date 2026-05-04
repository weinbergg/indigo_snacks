import { env } from '../../config/env';
import { AppError } from '../../utils/errors';
import type {
  OzonCreateOrderRequest,
  OzonCreateOrderResponse,
  OzonGetOrderStatusRequest,
  OzonGetOrderStatusResponse
} from './ozon-acquiring.types';

async function ozonPost<TResponse>(path: string, payload: unknown) {
  const requestUrl = new URL(path, env.OZON_ACQUIRING_API_URL);

  let response: Response;
  try {
    response = await fetch(requestUrl, {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'content-type': 'application/json'
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(env.OZON_ACQUIRING_TIMEOUT_MS)
    });
  } catch (error) {
    const errorCause =
      error && typeof error === 'object' && 'cause' in error
        ? (error as { cause?: unknown }).cause
        : undefined;

    throw new AppError('Не удалось связаться с Ozon Acquiring.', 502, {
      cause:
        error instanceof Error
          ? errorCause instanceof Error
            ? errorCause.message
            : error.message
          : 'unknown',
      requestUrl: requestUrl.toString()
    });
  }

  const rawBody = await response.text();
  const parsedBody = rawBody ? safeParseJson(rawBody) : undefined;

  if (!response.ok) {
    throw new AppError('Ozon Acquiring вернул ошибку.', 502, {
      ozonStatus: response.status,
      ozonResponse: parsedBody ?? rawBody
    });
  }

  if (!parsedBody) {
    throw new AppError('Ozon Acquiring вернул пустой ответ.', 502);
  }

  return parsedBody as TResponse;
}

function safeParseJson(value: string) {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

export function createOzonOrder(payload: OzonCreateOrderRequest) {
  return ozonPost<OzonCreateOrderResponse>('/v1/createOrder', payload);
}

export function getOzonOrderStatus(payload: OzonGetOrderStatusRequest) {
  return ozonPost<OzonGetOrderStatusResponse>('/v1/getOrderStatus', payload);
}
