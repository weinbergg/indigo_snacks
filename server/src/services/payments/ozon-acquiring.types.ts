export type OzonMoney = {
  currencyCode: string;
  value: string;
};

export type OzonOrderSnapshot = {
  expiresAt?: string;
  extId?: string;
  fiscalizationType?: string;
  id?: string;
  isTestMode?: boolean;
  items?: Array<{
    extId?: string;
    id?: string;
    name?: string;
    price?: OzonMoney;
    quantity?: number;
    sku?: number;
    type?: string;
    vat?: string;
  }>;
  mode?: string;
  number?: string;
  payLink?: string;
  paymentAlgorithm?: string;
  remainingAmount?: OzonMoney;
  status?: string;
};

export type OzonCreateOrderItem = {
  extId: string;
  name: string;
  price: OzonMoney;
  quantity: number;
  type?: 'TYPE_UNSPECIFIED';
  vat: 'VAT_UNSPECIFIED';
};

export type OzonCreateOrderRequest = {
  accessKey: string;
  amount: OzonMoney;
  enableFiscalization?: boolean;
  expiresAt?: string;
  extData?: Record<string, string>;
  extId: string;
  failUrl?: string;
  fiscalizationType?: 'FISCAL_TYPE_SINGLE' | 'FISCAL_TYPE_UNSPECIFIED';
  items?: OzonCreateOrderItem[];
  mode?: 'MODE_FULL' | 'MODE_SHORTENED' | 'MODE_UNSPECIFIED';
  notificationUrl?: string;
  paymentAlgorithm: 'PAY_ALGO_SMS' | 'PAY_ALGO_DMS';
  receiptEmail?: string;
  requestSign: string;
  successUrl?: string;
};

export type OzonCreateOrderResponse = {
  order?: {
    extData?: Record<string, string>;
    item?: OzonOrderSnapshot;
  };
  paymentDetails?: {
    paymentId?: string;
    sbp?: {
      payload?: string;
    };
    status?: string;
    type?: string;
  };
};

export type OzonGetOrderStatusRequest = {
  accessKey: string;
  extId?: string;
  id?: string;
  requestSign: string;
};

export type OzonGetOrderStatusResponse = {
  extId?: string;
  id?: string;
  isTestMode?: boolean;
  item?: OzonOrderSnapshot;
  order?: {
    extData?: Record<string, string>;
    item?: OzonOrderSnapshot;
  };
  originalAmount?: OzonMoney;
  paymentScheme?: Record<string, unknown>;
  remainingAmount?: OzonMoney;
  status?: string;
};

export type OzonNotificationPayload = {
  amount: number | string;
  currencyCode: string;
  operationType: string;
  requestSign: string;
  status: string;
  errorCode?: number | string;
  errorMessage?: string;
  extData?: unknown;
  extOrderID?: string;
  extTransactionId?: string;
  extTransactionID?: string;
  orderID?: string;
  paymentMethod?: string;
  paymentTime?: string;
  testMode?: number | string;
  transactionID?: number | string;
  transactionUid?: string;
  transactionUID?: string;
};

export type OzonResolvedNotificationPayload = {
  amount: string;
  currencyCode: string;
  errorCode?: string;
  errorMessage?: string;
  extData?: unknown;
  extOrderId?: string;
  extTransactionId?: string;
  operationType: string;
  orderId?: string;
  paymentMethod?: string;
  paymentTime?: string;
  requestSign: string;
  status: string;
  testMode?: string;
  transactionId?: string;
  transactionUid?: string;
};
