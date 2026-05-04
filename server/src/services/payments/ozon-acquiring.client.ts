import { env } from '../../config/env';
import { AppError } from '../../utils/errors';
import type {
  OzonCreatePaymentRequest,
  OzonCreatePaymentResponse,
  OzonGetPaymentDetailsRequest,
  OzonGetPaymentDetailsResponse
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
      requestPayload: payload,
      requestUrl: requestUrl.toString()
    });
  }

  const rawBody = await response.text();
  const parsedBody = rawBody ? safeParseJson(rawBody) : undefined;

  if (!response.ok) {
    const errorMessage =
      parsedBody &&
      typeof parsedBody === 'object' &&
      'message' in parsedBody &&
      typeof parsedBody.message === 'string'
        ? parsedBody.message
        : 'Сервис оплаты вернул ошибку.';

    throw new AppError('Ozon Acquiring вернул ошибку.', 502, {
      requestPayload: payload,
      requestUrl: requestUrl.toString(),
      upstreamMessage: errorMessage,
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

export function createOzonPayment(payload: OzonCreatePaymentRequest) {
  return ozonPost<OzonCreatePaymentResponse>('/v1/createPayment', payload);
}

export function getOzonPaymentDetails(payload: OzonGetPaymentDetailsRequest) {
  return ozonPost<OzonGetPaymentDetailsResponse>('/v1/getPaymentDetails', payload);
}
