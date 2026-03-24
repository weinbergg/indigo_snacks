import { prisma } from '../db/prisma';
import { AppError } from '../utils/errors';
import type { SubscriptionInput } from '../validators/subscription.validator';

export async function createSubscriptionRequest(input: SubscriptionInput) {
  const requestedItems = input.items.filter((item) => item.quantity > 0);

  if (requestedItems.length === 0) {
    throw new AppError('Выберите хотя бы одну фасовку для подписки.', 400);
  }

  const uniqueVariantIds = [...new Set(requestedItems.map((item) => item.variantId))];
  const variants = await prisma.productVariant.findMany({
    where: {
      id: {
        in: uniqueVariantIds
      }
    },
    include: { product: true }
  });

  if (variants.length !== uniqueVariantIds.length) {
    throw new AppError('Одна или несколько выбранных фасовок не найдены.', 400);
  }

  const variantsById = new Map(variants.map((variant) => [variant.id, variant]));
  const normalizedItems = requestedItems.map((item) => {
    const variant = variantsById.get(item.variantId);

    if (!variant) {
      throw new AppError('Одна или несколько выбранных фасовок не найдены.', 400);
    }

    return {
      variantId: variant.id,
      sku: variant.sku,
      productName: variant.product.name,
      variantLabel: variant.label,
      quantity: item.quantity
    };
  });

  const totalQuantity = normalizedItems.reduce((sum, item) => sum + item.quantity, 0);
  const summary = normalizedItems
    .map((item) => `${item.productName} — ${item.variantLabel} × ${item.quantity}`)
    .join(', ');

  return prisma.subscriptionRequest.create({
    data: {
      name: input.name,
      phone: input.phone,
      email: input.email,
      address: input.address,
      comment: input.comment,
      quantity: totalQuantity,
      frequency: input.frequency,
      status: 'NEW',
      variantId: normalizedItems[0]?.variantId,
      variantLabelSnapshot: summary,
      itemsJson: JSON.stringify(normalizedItems)
    },
    select: {
      id: true,
      createdAt: true
    }
  });
}
