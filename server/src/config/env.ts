import fs from 'node:fs';
import path from 'node:path';
import dotenv from 'dotenv';
import { z } from 'zod';

const envCandidates = [
  path.resolve(process.cwd(), '.env'),
  path.resolve(process.cwd(), '../.env')
];

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

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().min(1).max(65535).default(4000),
  DATABASE_URL: z.string().min(1),
  CLIENT_ORIGIN: z
    .string()
    .trim()
    .optional()
    .transform((value) => (value ? value : undefined)),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(60000),
  RATE_LIMIT_MAX: z.coerce.number().int().positive().default(60),
  FREE_DELIVERY_THRESHOLD_KOPECKS: z.coerce.number().int().nonnegative().default(350000),
  DEFAULT_DELIVERY_SURCHARGE_KOPECKS: z.coerce
    .number()
    .int()
    .nonnegative()
    .default(12000)
});

export const env = envSchema.parse(process.env);
