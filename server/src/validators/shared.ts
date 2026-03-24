import { z } from 'zod';

export const phoneSchema = z
  .string()
  .min(10, 'Укажите телефон для связи.')
  .max(20, 'Телефон слишком длинный.')
  .regex(/^[+\d\s()-]+$/, 'Телефон содержит недопустимые символы.');

export const optionalEmailSchema = z.preprocess(
  (value) => {
    if (typeof value === 'string' && value.trim() === '') {
      return undefined;
    }

    return value;
  },
  z.string().email('Укажите корректный email.').optional()
);

export const optionalTextSchema = z.preprocess(
  (value) => {
    if (typeof value === 'string' && value.trim() === '') {
      return undefined;
    }

    return value;
  },
  z.string().max(600).optional()
);
