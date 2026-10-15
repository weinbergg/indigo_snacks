import { prisma } from '../db/prisma';
import { catalogSeed } from '../db/catalog-seed';

const LEGACY_PRICE_KOPECKS = new Set([25000, 45000, 190000]);

export async function bootstrapCatalog() {
  for (const product of catalogSeed) {
    const activeSkus = product.variants.map((variant) => variant.sku);

    await prisma.product.upsert({
      where: { slug: product.slug },
      update: {
        name: product.name,
        shortDescription: product.shortDescription,
        description: product.description,
        baseImage: product.baseImage,
        badge: product.badge,
        isActive: true,
        sortOrder: product.sortOrder
      },
      create: {
        id: product.id,
        slug: product.slug,
        name: product.name,
        shortDescription: product.shortDescription,
        description: product.description,
        baseImage: product.baseImage,
        badge: product.badge,
        isActive: true,
        sortOrder: product.sortOrder
      }
    });

    for (const variant of product.variants) {
      const existing = await prisma.productVariant.findUnique({
        where: { sku: variant.sku },
        select: { priceKopecks: true }
      });
      const shouldWritePrice = !existing || LEGACY_PRICE_KOPECKS.has(existing.priceKopecks);

      await prisma.productVariant.upsert({
        where: { sku: variant.sku },
        update: {
          productId: product.id,
          label: variant.label,
          weightGrams: variant.weightGrams,
          ...(shouldWritePrice ? { priceKopecks: variant.priceKopecks } : {}),
          compareAtPriceKopecks: variant.compareAtPriceKopecks,
          description: variant.description,
          image: variant.image,
          isAvailable: true,
          sortOrder: variant.sortOrder
        },
        create: {
          id: variant.id,
          productId: product.id,
          sku: variant.sku,
          label: variant.label,
          weightGrams: variant.weightGrams,
          priceKopecks: variant.priceKopecks,
          compareAtPriceKopecks: variant.compareAtPriceKopecks,
          description: variant.description,
          image: variant.image,
          isAvailable: true,
          sortOrder: variant.sortOrder
        }
      });
    }

    await prisma.productVariant.deleteMany({
      where: {
        productId: product.id,
        sku: {
          notIn: activeSkus
        }
      }
    });
  }
}

export async function listProducts() {
  return prisma.product.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: 'asc' },
    select: {
      id: true,
      slug: true,
      name: true,
      shortDescription: true,
      description: true,
      baseImage: true,
      badge: true,
      isActive: true,
      sortOrder: true,
      variants: {
        where: { isAvailable: true },
        orderBy: { sortOrder: 'asc' },
        select: {
          id: true,
          sku: true,
          label: true,
          weightGrams: true,
          priceKopecks: true,
          compareAtPriceKopecks: true,
          description: true,
          image: true,
          isAvailable: true,
          sortOrder: true
        }
      }
    }
  });
}

export async function listAdminVariants() {
  return prisma.productVariant.findMany({
    orderBy: [{ product: { sortOrder: 'asc' } }, { sortOrder: 'asc' }],
    select: {
      id: true,
      sku: true,
      label: true,
      weightGrams: true,
      priceKopecks: true,
      product: {
        select: {
          name: true
        }
      }
    }
  });
}

export async function updateVariantPrices(
  updates: Array<{ sku: string; priceKopecks: number }>
) {
  await prisma.$transaction(
    updates.map((update) =>
      prisma.productVariant.update({
        where: { sku: update.sku },
        data: { priceKopecks: update.priceKopecks }
      })
    )
  );
}
