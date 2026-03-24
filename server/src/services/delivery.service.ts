import { env } from '../config/env';
import type { DeliveryCalculationInput } from '../validators/delivery.validator';

const deliveryCatalog = {
  CDEK: {
    label: 'СДЭК',
    baseKopecks: 39000,
    etaText: '2-5 дней'
  },
  OZON_PICKUP: {
    label: 'Пункт выдачи',
    baseKopecks: 29000,
    etaText: '2-4 дня'
  },
  POST_COURIER: {
    label: 'Почта / курьер',
    baseKopecks: 45000,
    etaText: '3-7 дней'
  }
} as const;

export function calculateDeliveryQuote(input: DeliveryCalculationInput) {
  const method = deliveryCatalog[input.deliveryMethod];
  let amountKopecks: number = method.baseKopecks;
  let note = 'Фиксированная стоимость доставки.';

  if (input.subtotalKopecks >= env.FREE_DELIVERY_THRESHOLD_KOPECKS) {
    amountKopecks = 0;
    note = 'Доставка бесплатна по порогу суммы заказа.';
  } else if (input.totalWeightGrams > 1500) {
    amountKopecks += env.DEFAULT_DELIVERY_SURCHARGE_KOPECKS;
    note = 'Базовый тариф плюс надбавка за вес.';
  }

  return {
    method: input.deliveryMethod,
    label: method.label,
    amountKopecks,
    etaText: method.etaText,
    note,
    freeFromKopecks: env.FREE_DELIVERY_THRESHOLD_KOPECKS
  };
}

// Future adapter point: replace this static calculator with a provider-backed service
// for CDEK / Ozon / courier APIs without changing route contracts.
