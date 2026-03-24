import { z } from 'zod';
import { sanitizePayload } from '../utils/sanitize';
import { optionalEmailSchema, phoneSchema } from './shared';

const leadSchema = z.object({
  name: z.string().min(2, 'Введите имя.').max(80, 'Слишком длинное имя.'),
  phone: phoneSchema,
  email: optionalEmailSchema,
  message: z.string().min(8, 'Добавьте комментарий.').max(600, 'Сообщение слишком длинное.'),
  consent: z.literal(true, {
    errorMap: () => ({ message: 'Нужно согласие на обработку данных.' })
  })
});

export type LeadInput = z.infer<typeof leadSchema>;

export function parseLeadInput(input: unknown) {
  return leadSchema.parse(sanitizePayload(input));
}
