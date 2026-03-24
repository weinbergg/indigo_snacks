import type { Product } from '../types/api';

export const fallbackProducts: Product[] = [
  {
    id: 'prod_indigo_turkey',
    slug: 'snacks-iz-indeyki',
    name: 'Снеки из индейки',
    shortDescription: 'Натуральные снеки для собак из индейки в трех фасовках.',
    description:
      'Лакомство с чистым составом и деликатной текстурой для ежедневного поощрения дома, на прогулке и в дороге.',
    baseImage: '/assets/brand/scene-packages.jpeg',
    badge: '3 фасовки',
    isActive: true,
    sortOrder: 1,
    variants: [
      {
        id: 'variant_indigo_turkey_50',
        sku: 'INDIGO-TURKEY-50',
        label: '50 г',
        weightGrams: 50,
        priceKopecks: 25000,
        compareAtPriceKopecks: null,
        description: 'Пакетик на 50 грамм для прогулки, поощрения и ежедневного запаса дома.',
        image: '/assets/brand/product-pack.jpeg',
        isAvailable: true,
        sortOrder: 1
      },
      {
        id: 'variant_indigo_turkey_100',
        sku: 'INDIGO-TURKEY-100',
        label: '100 г',
        weightGrams: 100,
        priceKopecks: 45000,
        compareAtPriceKopecks: null,
        description: 'Удобная фасовка на регулярное использование дома и на неделю спокойных поощрений.',
        image: '/assets/brand/scene-packages.jpeg',
        isAvailable: true,
        sortOrder: 2
      },
      {
        id: 'variant_indigo_turkey_500',
        sku: 'INDIGO-TURKEY-500',
        label: '500 г',
        weightGrams: 500,
        priceKopecks: 190000,
        compareAtPriceKopecks: null,
        description: 'Большой запас для тех, кто берет Индиго регулярно и хочет реже пополнять заказ.',
        image: '/assets/brand/product-closeup.jpeg',
        isAvailable: true,
        sortOrder: 3
      }
    ]
  }
];
