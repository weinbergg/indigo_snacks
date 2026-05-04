export type OzonMoney = {
  currencyCode: string;
  value: string;
};

export type OzonCreatePaymentRequest = {
  accessKey: string;
  amount: OzonMoney;
  extId: string;
  notificationUrl?: string;
  order?: {
    amount: OzonMoney;
    extId: string;
    expiresAt?: string;
    failUrl?: string;
    notificationUrl?: string;
    successUrl?: string;
  };
  payType: 'SBP';
  redirectUrl: string;
  requestSign: string;
  ttl?: number;
  userInfo?: {
    extId?: string;
    ipAddress?: string;
  };
};

export type OzonCreatePaymentResponse = {
  order?: {
    extData?: Record<string, string>;
    item?: {
      expiresAt?: string;
      extId?: string;
      id?: string;
      isTestMode?: boolean;
      number?: string;
      payLink?: string;
      status?: string;
    };
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

export type OzonGetPaymentDetailsRequest = {
  accessKey: string;
  id: string;
  requestSign: string;
};

export type OzonGetPaymentDetailsResponse = {
  items?: Array<{
    amount?: OzonMoney;
    extId?: string;
    operationTime?: string;
    operationType?: string;
    paymentData?: {
      sbp?: {
        createdSubscriptionToken?: string;
        memberId?: string;
        nspkId?: string;
        payerPhoneLast4?: string;
      };
    };
    status?: string;
    transactionUid?: string;
  }>;
};

export type OzonCancelPaymentRequest = {
  accessKey: string;
  id: string;
  requestSign: string;
};

export type OzonRefundPaymentRequest = {
  accessKey: string;
  amount: OzonMoney;
  extId: string;
  paymentId: string;
  requestSign: string;
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
