import { z } from 'zod';
import { sanitizePayload } from '../utils/sanitize';
import { optionalEmailSchema, optionalTextSchema, phoneSchema } from './shared';

const subscriptionItemSchema = z.object({
  variantId: z.string().min(1, 'Выберите фасовку.'),
  quantity: z.coerce.number().int().min(0).max(30)
});

const subscriptionSchema = z
  .object({
    name: z.string().min(2, 'Введите имя.').max(80, 'Слишком длинное имя.'),
    phone: phoneSchema,
    email: optionalEmailSchema,
    items: z.array(subscriptionItemSchema).min(1, 'Добавьте хотя бы одну фасовку.'),
    frequency: z.enum(['WEEKLY', 'BIWEEKLY', 'MONTHLY']),
    address: z.string().min(8, 'Укажите адрес.').max(220, 'Адрес слишком длинный.'),
    comment: optionalTextSchema
  })
  .superRefine((value, context) => {
    if (!value.items.some((item) => item.quantity > 0)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Выберите хотя бы одну фасовку для регулярного заказа.',
        path: ['items']
      });
    }
  });

export type SubscriptionInput = z.infer<typeof subscriptionSchema>;

export function parseSubscriptionInput(input: unknown) {
  return subscriptionSchema.parse(sanitizePayload(input));
}
