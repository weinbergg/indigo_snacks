export type DeliveryMethodCode = 'CDEK' | 'OZON_PICKUP' | 'POST_COURIER';
export type PaymentMethodCode =
  | 'ONLINE_PLACEHOLDER'
  | 'PAYMENT_LINK_LATER'
  | 'MANAGER_COORDINATION';
export type SubscriptionFrequency = 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY';

export interface ProductVariant {
  id: string;
  sku: string;
  label: string;
  weightGrams: number;
  priceKopecks: number;
  compareAtPriceKopecks?: number | null;
  description?: string | null;
  image?: string | null;
  isAvailable: boolean;
  sortOrder: number;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  shortDescription: string;
  description: string;
  baseImage?: string | null;
  badge?: string | null;
  isActive: boolean;
  sortOrder: number;
  variants: ProductVariant[];
}

export interface DeliveryQuote {
  method: DeliveryMethodCode;
  label: string;
  amountKopecks: number;
  etaText: string;
  note: string;
  freeFromKopecks: number;
}

export interface ApiSuccess<T> {
  success: true;
  data: T;
}

export interface LeadResponse {
  id: string;
  createdAt: string;
}

export interface SubscriptionResponse {
  id: string;
  createdAt: string;
}

export interface OrderResponse {
  orderNumber: string;
  totalKopecks: number;
  paymentMessage: string;
}
