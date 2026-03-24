import path from 'node:path';
import { spawnSync } from 'node:child_process';
import dotenv from 'dotenv';

const serverDir = path.resolve(process.cwd());
const rootEnvPath = path.resolve(serverDir, '../.env');
const localEnvPath = path.resolve(serverDir, '.env');

dotenv.config({ path: rootEnvPath, override: false });
dotenv.config({ path: localEnvPath, override: false });

if (process.env.DATABASE_URL?.startsWith('file:')) {
  const filePath = process.env.DATABASE_URL.slice('file:'.length);

  if (!path.isAbsolute(filePath)) {
    process.env.DATABASE_URL = `file:${path.resolve(serverDir, 'prisma', filePath)}`;
  }
}

const prismaBin = path.resolve(serverDir, '../node_modules/.bin/prisma');
const args = process.argv.slice(2);
const result = spawnSync(prismaBin, args, {
  stdio: 'inherit',
  env: process.env,
  cwd: serverDir,
  shell: process.platform === 'win32'
});

process.exit(result.status ?? 1);
