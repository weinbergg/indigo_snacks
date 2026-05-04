import fs from 'node:fs';
import path from 'node:path';
import dotenv from 'dotenv';
import { z } from 'zod';

const envCandidates = [
  path.resolve(process.cwd(), '.env'),
  path.resolve(process.cwd(), '../.env')
];

function normalizeOzonApiUrl(apiUrl: string | undefined) {
  if (!apiUrl) {
    return 'https://payapi.ozon.ru';
  }

  try {
    const parsed = new URL(apiUrl);
    if (parsed.hostname === 'api.ozon.ru') {
      return 'https://payapi.ozon.ru';
    }
  } catch {
    return apiUrl;
  }

  return apiUrl;
}

for (const candidate of envCandidates) {
  if (fs.existsSync(candidate)) {
    dotenv.config({ path: candidate, override: false });
  }
}

function resolveDatabaseUrl(databaseUrl: string | undefined) {
  if (!databaseUrl || !databaseUrl.startsWith('file:')) {
    return databaseUrl;
  }

  const filePath = databaseUrl.slice('file:'.length);

  if (path.isAbsolute(filePath)) {
    return databaseUrl;
  }

  const prismaDir = path.resolve(__dirname, '../../prisma');
  return `file:${path.resolve(prismaDir, filePath)}`;
}

if (process.env.DATABASE_URL) {
  process.env.DATABASE_URL = resolveDatabaseUrl(process.env.DATABASE_URL);
}

const optionalStringSchema = z
  .string()
  .trim()
  .optional()
  .transform((value) => (value ? value : undefined));

const booleanFlagSchema = z
  .string()
  .trim()
  .optional()
  .transform((value) => {
    const normalized = value?.toLowerCase();
    return normalized === 'true' || normalized === '1' || normalized === 'yes' || normalized === 'on';
  });

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().min(1).max(65535).default(4000),
  DATABASE_URL: z.string().min(1),
  CLIENT_ORIGIN: optionalStringSchema,
  RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(60000),
  RATE_LIMIT_MAX: z.coerce.number().int().positive().default(60),
  FREE_DELIVERY_THRESHOLD_KOPECKS: z.coerce.number().int().nonnegative().default(350000),
  DEFAULT_DELIVERY_SURCHARGE_KOPECKS: z.coerce
    .number()
    .int()
    .nonnegative()
    .default(12000),
  OZON_ACQUIRING_ENABLED: booleanFlagSchema,
  OZON_ACQUIRING_TEST_MODE: booleanFlagSchema,
  OZON_ACQUIRING_API_URL: z
    .string()
    .trim()
    .url()
    .default('https://payapi.ozon.ru')
    .transform((value) => normalizeOzonApiUrl(value)),
  OZON_ACQUIRING_ACCESS_KEY: optionalStringSchema,
  OZON_ACQUIRING_SECRET_KEY: optionalStringSchema,
  OZON_ACQUIRING_NOTIFICATION_SECRET_KEY: optionalStringSchema,
  OZON_ACQUIRING_REDIRECT_URL: optionalStringSchema,
  OZON_ACQUIRING_SUCCESS_URL: optionalStringSchema,
  OZON_ACQUIRING_FAIL_URL: optionalStringSchema,
  OZON_ACQUIRING_NOTIFICATION_URL: optionalStringSchema,
  OZON_ACQUIRING_TIMEOUT_MS: z.coerce.number().int().positive().default(15000),
  OZON_ACQUIRING_PAYMENT_TTL_SECONDS: z.coerce.number().int().positive().default(1800)
});

export const env = envSchema.parse(process.env);
