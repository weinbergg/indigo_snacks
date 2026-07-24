import { z } from 'zod';

const phoneSchema = z
  .string()
  .trim()
  .min(10, 'Укажите телефон для связи.')
  .max(20, 'Телефон слишком длинный.')
  .regex(/^[+\d\s()-]+$/, 'Телефон содержит недопустимые символы.');

const optionalEmailSchema = z
  .string()
  .trim()
  .email('Укажите корректный email.')
  .or(z.literal(''))
  .transform((value) => value || undefined);

export const checkoutFormSchema = z.object({
  name: z.string().trim().min(2, 'Введите имя.').max(80, 'Слишком длинное имя.'),
  phone: phoneSchema,
  email: optionalEmailSchema,
  city: z.string().trim().min(2, 'Укажите город.').max(80, 'Слишком длинное значение.'),
  address: z
    .string()
    .trim()
    .min(8, 'Укажите адрес доставки.')
    .max(220, 'Адрес слишком длинный.'),
  postalCode: z
    .string()
    .trim()
    .min(4, 'Укажите индекс.')
    .max(12, 'Слишком длинный индекс.'),
  comment: z
    .string()
    .trim()
    .max(600, 'Комментарий слишком длинный.')
    .or(z.literal(''))
    .transform((value) => value || undefined),
  deliveryMethod: z.enum(['CDEK', 'OZON_PICKUP', 'POST_COURIER']),
  paymentMethod: z.enum([
    'OZON_ACQUIRING',
    'ONLINE_PLACEHOLDER',
    'PAYMENT_LINK_LATER',
    'MANAGER_COORDINATION'
  ])
});

export type CheckoutFormValues = z.infer<typeof checkoutFormSchema>;
