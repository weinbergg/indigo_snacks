import type { ApiSuccess } from '../types/api';

const API_BASE_URL =
  (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, '') ||
  '/api';

export async function apiRequest<T>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options?.headers ?? {})
    },
    ...options
  });

  const payload = (await response.json().catch(() => null)) as
    | ApiSuccess<T>
    | { success?: false; error?: { message?: string } }
    | null;

  if (!response.ok || !payload || payload.success !== true) {
    throw new Error(
      payload && 'error' in payload && payload.error?.message
        ? payload.error.message
        : 'Не удалось выполнить запрос.'
    );
  }

  return payload.data;
}
