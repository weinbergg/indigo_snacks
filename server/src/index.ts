import { createServer } from 'node:http';
import { env } from './config/env';
import { prisma } from './db/prisma';
import { createApp } from './app';
import { bootstrapCatalog } from './services/product.service';

async function bootstrap() {
  await prisma.$connect();
  await bootstrapCatalog();

  const app = createApp();
  const server = createServer(app);

  server.listen(env.PORT, () => {
    console.log(`API started on port ${env.PORT}`);
  });

  const shutdown = async () => {
    server.close(async () => {
      await prisma.$disconnect();
      process.exit(0);
    });
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

bootstrap().catch(async (error) => {
  console.error(error);
  await prisma.$disconnect();
  process.exit(1);
});
