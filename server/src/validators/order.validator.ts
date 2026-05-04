import { z } from 'zod';
import { sanitizePayload } from '../utils/sanitize';
import { optionalEmailSchema, optionalTextSchema, phoneSchema } from './shared';

const orderSchema = z.object({
  name: z.string().min(2, 'Введите имя.').max(80, 'Слишком длинное имя.'),
  phone: phoneSchema,
  email: optionalEmailSchema,
  city: z.string().min(2, 'Укажите город.').max(80, 'Слишком длинное значение.'),
  address: z.string().min(8, 'Укажите адрес доставки.').max(220, 'Адрес слишком длинный.'),
  postalCode: z.string().min(4, 'Укажите индекс.').max(12, 'Слишком длинный индекс.'),
  comment: optionalTextSchema,
  deliveryMethod: z.enum(['CDEK', 'OZON_PICKUP', 'POST_COURIER']),
  paymentMethod: z.enum([
    'OZON_ACQUIRING',
    'ONLINE_PLACEHOLDER',
    'PAYMENT_LINK_LATER',
    'MANAGER_COORDINATION'
  ]),
  items: z
    .array(
      z.object({
        variantId: z.string().min(1),
        quantity: z.coerce.number().int().min(1).max(99)
      })
    )
    .min(1, 'Добавьте хотя бы один товар.')
});

export type OrderInput = z.infer<typeof orderSchema>;

export function parseOrderInput(input: unknown) {
  return orderSchema.parse(sanitizePayload(input));
}
