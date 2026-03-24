import type {
  DeliveryMethodCode,
  PaymentMethodCode,
  SubscriptionFrequency
} from '../types/api';

export const heroStats = [
  { value: 'Натурально', label: 'понятный состав' },
  { value: 'Доступно', label: 'честная цена' },
  { value: 'Удобно', label: 'легко заказать' }
];

export const benefits = [
  {
    title: 'Натуральный продукт',
    text: 'Индиго делает ставку на понятный состав и спокойный подход к ежедневному поощрению собаки.'
  },
  {
    title: 'Доступный выбор',
    text: 'Это лакомство, которое удобно брать регулярно: без лишнего пафоса, но с аккуратной подачей и хорошим качеством.'
  },
  {
    title: 'Удобный заказ',
    text: 'Каталог, корзина и форма повторного заказа собраны так, чтобы покупка занимала минимум времени.'
  }
];

export const orderingSteps = [
  {
    step: '01',
    title: 'Добавьте упаковку в корзину',
    text: 'В каталоге доступны три фасовки: 50 г, 100 г и 500 г. Можно выбрать одну или собрать удобную комбинацию.'
  },
  {
    step: '02',
    title: 'Укажите адрес и контакты',
    text: 'Заполните форму, выберите доставку и оставьте комментарий, если есть пожелания.'
  },
  {
    step: '03',
    title: 'Подтвердим заказ',
    text: 'После оформления мы связываемся с вами, подтверждаем наличие, доставку и удобный способ оплаты.'
  }
];

export const galleryItems = [
  {
    src: '/assets/brand/scene-packages.jpeg',
    alt: 'Несколько упаковок снеков Индиго в теплом дневном свете',
    caption: 'Линейка фасовок для дома, дороги и регулярных заказов',
    position: 'center center'
  },
  {
    src: '/assets/brand/product-pack.jpeg',
    alt: 'Пакет снеков Индиго из индейки, 50 грамм',
    caption: 'Компактная фасовка 50 г для первого заказа и прогулок',
    position: 'center top'
  },
  {
    src: '/assets/brand/product-closeup.jpeg',
    alt: 'Крупный план ломтиков индейки рядом с упаковкой Индиго',
    caption: 'Натуральная текстура и спокойная подача бренда',
    position: '56% center'
  }
];

export const deliveryOptions: Array<{
  value: DeliveryMethodCode;
  label: string;
  hint: string;
}> = [
  {
    value: 'CDEK',
    label: 'СДЭК',
    hint: 'Подойдет, если нужен удобный и понятный способ доставки по адресу или в пункт выдачи.'
  },
  {
    value: 'OZON_PICKUP',
    label: 'Пункт выдачи',
    hint: 'Удобный вариант, если хотите забрать заказ самостоятельно.'
  },
  {
    value: 'POST_COURIER',
    label: 'Почта / курьер',
    hint: 'Подходит для отправки в регионы и индивидуального согласования доставки.'
  }
];

export const paymentOptions: Array<{
  value: PaymentMethodCode;
  label: string;
  hint: string;
}> = [
  {
    value: 'ONLINE_PLACEHOLDER',
    label: 'Оплата после подтверждения',
    hint: 'После оформления мы свяжемся с вами и отправим дальнейшие шаги по оплате.'
  },
  {
    value: 'PAYMENT_LINK_LATER',
    label: 'Оплата по ссылке позже',
    hint: 'Ссылку на оплату отправим после подтверждения наличия и доставки.'
  },
  {
    value: 'MANAGER_COORDINATION',
    label: 'Согласование с менеджером',
    hint: 'Если хотите сначала уточнить детали, этот вариант подойдет лучше всего.'
  }
];

export const subscriptionOptions: Array<{
  value: SubscriptionFrequency;
  label: string;
}> = [
  { value: 'WEEKLY', label: 'Еженедельно' },
  { value: 'BIWEEKLY', label: 'Раз в 2 недели' },
  { value: 'MONTHLY', label: 'Ежемесячно' }
];

export const legalNotice =
  'После оформления заказа мы подтверждаем наличие, доставку и удобный способ оплаты в личной коммуникации.';
