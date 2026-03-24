import { prisma } from '../src/db/prisma';
import { bootstrapCatalog } from '../src/services/product.service';

async function main() {
  await bootstrapCatalog();
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
