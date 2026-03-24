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

export const leadFormSchema = z.object({
  name: z.string().trim().min(2, 'Введите имя.').max(80, 'Слишком длинное имя.'),
  phone: phoneSchema,
  email: optionalEmailSchema,
  message: z
    .string()
    .trim()
    .min(8, 'Добавьте комментарий или запрос.')
    .max(600, 'Сообщение слишком длинное.'),
  consent: z
    .boolean()
    .refine((value) => value, 'Нужно согласие на обработку данных.')
});

const subscriptionItemSchema = z.object({
  variantId: z.string().min(1, 'Выберите фасовку.'),
  quantity: z.coerce
    .number()
    .int()
    .min(0, 'Минимум 0 упаковок.')
    .max(30, 'Максимум 30 упаковок.')
});

export const subscriptionFormSchema = z
  .object({
    name: z.string().trim().min(2, 'Введите имя.').max(80, 'Слишком длинное имя.'),
    phone: phoneSchema,
    email: optionalEmailSchema,
    items: z.array(subscriptionItemSchema).min(1, 'Добавьте хотя бы одну фасовку.'),
    frequency: z.enum(['WEEKLY', 'BIWEEKLY', 'MONTHLY']),
    address: z
      .string()
      .trim()
      .min(8, 'Укажите адрес для подписки.')
      .max(220, 'Адрес слишком длинный.'),
    comment: z
      .string()
      .trim()
      .max(600, 'Комментарий слишком длинный.')
      .or(z.literal(''))
      .transform((value) => value || undefined)
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
    'ONLINE_PLACEHOLDER',
    'PAYMENT_LINK_LATER',
    'MANAGER_COORDINATION'
  ])
});

export type LeadFormValues = z.infer<typeof leadFormSchema>;
export type SubscriptionFormValues = z.infer<typeof subscriptionFormSchema>;
export type CheckoutFormValues = z.infer<typeof checkoutFormSchema>;
