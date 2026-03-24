export function sanitizePayload<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map((entry) => sanitizePayload(entry)) as T;
  }

  if (value && typeof value === 'object') {
    return Object.entries(value as Record<string, unknown>).reduce(
      (accumulator, [key, entry]) => {
        accumulator[key] = sanitizePayload(entry);
        return accumulator;
      },
      {} as Record<string, unknown>
    ) as T;
  }

  if (typeof value === 'string') {
    return value.trim().replace(/\s{2,}/g, ' ') as T;
  }

  return value;
}
