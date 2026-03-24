import { prisma } from '../db/prisma';
import { AppError } from '../utils/errors';
import { createOrderNumber } from '../utils/order-number';
import { calculateDeliveryQuote } from './delivery.service';
import { getPaymentPlan } from './payment.service';
import type { OrderInput } from '../validators/order.validator';

export async function createOrder(input: OrderInput) {
  const variantIds = [...new Set(input.items.map((item) => item.variantId))];
  const variants = await prisma.productVariant.findMany({
    where: {
      id: { in: variantIds }
    },
    include: {
      product: true
    }
  });

  if (variants.length !== variantIds.length) {
    throw new AppError('Один или несколько товаров не найдены.', 400);
  }

  const preparedItems = input.items.map((item) => {
    const variant = variants.find((entry) => entry.id === item.variantId);

    if (!variant) {
      throw new AppError('Товар корзины не найден.', 400);
    }

    if (!variant.isAvailable) {
      throw new AppError(`Фасовка ${variant.label} временно недоступна.`, 400);
    }

    return {
      variant,
      quantity: item.quantity,
      lineTotalKopecks: item.quantity * variant.priceKopecks
    };
  });

  const subtotalKopecks = preparedItems.reduce(
    (total, item) => total + item.lineTotalKopecks,
    0
  );
  const totalWeightGrams = preparedItems.reduce(
    (total, item) => total + item.variant.weightGrams * item.quantity,
    0
  );
  const deliveryQuote = calculateDeliveryQuote({
    deliveryMethod: input.deliveryMethod,
    subtotalKopecks,
    totalWeightGrams
  });
  const paymentPlan = getPaymentPlan(input.paymentMethod);
  const orderNumber = createOrderNumber();
  const totalKopecks = subtotalKopecks + deliveryQuote.amountKopecks;

  const order = await prisma.order.create({
    data: {
      orderNumber,
      customerName: input.name,
      phone: input.phone,
      email: input.email,
      city: input.city,
      address: input.address,
      postalCode: input.postalCode,
      comment: input.comment,
      subtotalKopecks,
      deliveryCostKopecks: deliveryQuote.amountKopecks,
      totalKopecks,
      deliveryMethod: input.deliveryMethod,
      deliveryQuoteLabel: deliveryQuote.label,
      paymentMethod: input.paymentMethod,
      paymentStatus: paymentPlan.paymentStatus,
      paymentNote: paymentPlan.paymentMessage,
      status: 'NEW',
      items: {
        create: preparedItems.map((item) => ({
          variantId: item.variant.id,
          sku: item.variant.sku,
          productName: item.variant.product.name,
          variantLabel: item.variant.label,
          quantity: item.quantity,
          unitPriceKopecks: item.variant.priceKopecks,
          totalPriceKopecks: item.lineTotalKopecks
        }))
      }
    },
    select: {
      orderNumber: true,
      totalKopecks: true
    }
  });

  return {
    orderNumber: order.orderNumber,
    totalKopecks: order.totalKopecks,
    paymentMessage: paymentPlan.paymentMessage
  };
}
