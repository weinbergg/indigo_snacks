import { z } from 'zod';
import { sanitizePayload } from '../utils/sanitize';

const deliveryCalculationSchema = z.object({
  deliveryMethod: z.enum(['CDEK', 'OZON_PICKUP', 'POST_COURIER']),
  subtotalKopecks: z.coerce.number().int().nonnegative(),
  totalWeightGrams: z.coerce.number().int().nonnegative()
});

export type DeliveryCalculationInput = z.infer<typeof deliveryCalculationSchema>;

export function parseDeliveryCalculationInput(input: unknown) {
  return deliveryCalculationSchema.parse(sanitizePayload(input));
}
