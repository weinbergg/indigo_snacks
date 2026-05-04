export function getPaymentPlan(
  method:
    | 'OZON_ACQUIRING'
    | 'ONLINE_PLACEHOLDER'
    | 'PAYMENT_LINK_LATER'
    | 'MANAGER_COORDINATION'
) {
  switch (method) {
    case 'OZON_ACQUIRING':
      return {
        paymentStatus: 'PENDING',
        paymentMessage:
          'После оформления откроем защищенную страницу оплаты Ozon Acquiring.'
      };
    case 'ONLINE_PLACEHOLDER':
      return {
        paymentStatus: 'PENDING',
        paymentMessage:
          'После подтверждения заказа мы свяжемся с вами и отправим дальнейшие шаги по оплате.'
      };
    case 'PAYMENT_LINK_LATER':
      return {
        paymentStatus: 'MANUAL_ACTION',
        paymentMessage:
          'После подтверждения наличия и доставки мы отправим ссылку на оплату.'
      };
    case 'MANAGER_COORDINATION':
      return {
        paymentStatus: 'MANUAL_ACTION',
        paymentMessage:
          'После оформления заказа мы согласуем с вами удобный способ оплаты.'
      };
    default:
      return {
        paymentStatus: 'PENDING',
        paymentMessage: 'Статус оплаты будет уточнен менеджером.'
      };
  }
}

// Manual fallback layer. Real gateways live in server/src/services/payments/.
