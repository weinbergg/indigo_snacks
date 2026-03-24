# Индиго Снэкс

Легкий full-stack MVP сайта бренда натуральных кормов/снеков для собак `Индиго Снэкс` под недорогой VPS. Фронтенд собирается в статический Vite build, сервер занимается только API и SQLite, без SSR и тяжелой инфраструктуры.

## 1. Архитектурный план

- `Vite + React + TypeScript + Tailwind + Framer Motion` дают быстрый статический фронтенд, который почти не нагружает VPS в production, потому что отдается обычными файлами через Nginx.
- `Express + Prisma + SQLite` достаточно для MVP: формы, заказы, подписки, mock-доставка и каталог. На старте это проще и дешевле, чем PostgreSQL, но слой сервисов и Prisma-модели позволяют потом перейти на Postgres без переписывания фронтенда и API-контрактов.
- `Nginx + PM2` покрывают production на 1 vCPU / 1 GB RAM: Nginx раздает статику и проксирует `/api`, PM2 держит один backend-процесс и рестартует его при сбое.
- Сервер не рендерит HTML, а только обслуживает API. Это сохраняет RAM и CPU, а UI остается современным за счет SPA, lazy routes, локального состояния корзины и легких анимаций.

## 2. Структура проекта

```text
.
├── client
│   ├── public/assets/brand
│   ├── src
│   │   ├── app
│   │   ├── components
│   │   ├── data
│   │   ├── hooks
│   │   ├── layouts
│   │   ├── lib
│   │   ├── pages
│   │   ├── sections
│   │   ├── store
│   │   ├── styles
│   │   └── types
│   ├── index.html
│   ├── tailwind.config.ts
│   └── vite.config.ts
├── server
│   ├── prisma
│   │   ├── migrations
│   │   ├── schema.prisma
│   │   └── seed.ts
│   └── src
│       ├── config
│       ├── controllers
│       ├── db
│       ├── middleware
│       ├── routes
│       ├── services
│       ├── utils
│       └── validators
├── deploy/nginx/indigo-snacks.conf
├── ecosystem.config.cjs
├── package.json
└── .env.example
```

## 3. Что уже реализовано в коде

### Frontend

- Главная страница с секциями: `Header`, `Hero`, преимущества, о продукте, каталог фасовок, how-to-order, MVP подписка, gallery, форма заявки, `Footer`.
- Отдельные страницы: `Catalog`, `Checkout`, `Privacy`, `Terms`, `404`.
- Корзина на `Zustand` с `localStorage`, изменением количества и восстановлением после перезагрузки.
- `React Hook Form + Zod` для lead form, subscription form и checkout.
- Дизайн-система на CSS variables + Tailwind tokens.
- Легкие анимации на `Framer Motion`, lazy route loading, semantic markup, базовые meta/OG tags.

### Backend API

- `GET /api/products`
- `POST /api/leads`
- `POST /api/orders`
- `POST /api/subscriptions`
- `POST /api/delivery/calculate`
- Базовая защита: `helmet`, JSON size limit, `express-rate-limit`, серверная валидация `Zod`, sanitize, единый error handler.

### Бизнес-логика

- Каталог хранится не в JSX, а в seed-слое сервера и отдается через API.
- Доставка реализована как честный mock calculator с абстракцией под будущую интеграцию.
- Оплата реализована как честный placeholder service без ложной симуляции эквайринга.
- Заявки, заказы и запросы на подписку сохраняются в SQLite.

## 4. Schema и migrations

Основные Prisma-файлы:

- `server/prisma/schema.prisma`
- `server/prisma/migrations/20260319170000_init/migration.sql`

Таблицы:

- `products`
- `product_variants`
- `leads`
- `orders`
- `order_items`
- `subscription_requests`

Модели уже готовы под:

- новые товары
- новые фасовки
- расширение доставки
- подключение реальной оплаты
- переход с SQLite на PostgreSQL через замену datasource/provider и новые миграции

## 5. Переменные окружения

Примеры в корне:

- `.env.example` — локальная разработка
- `.env.production.example` — production для VPS/домена

```env
NODE_ENV=development
PORT=4000
DATABASE_URL="file:./prisma/dev.db"
CLIENT_ORIGIN="http://localhost:5173"
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX=60
FREE_DELIVERY_THRESHOLD_KOPECKS=350000
DEFAULT_DELIVERY_SURCHARGE_KOPECKS=12000
VITE_API_BASE_URL="/api"
VITE_PROXY_TARGET="http://localhost:4000"
```

## 6. PM2

Файл: `ecosystem.config.cjs`

Особенности:

- один процесс
- `fork` mode
- `max_memory_restart: 300M`
- подходит для VPS 1 GB RAM

Запуск:

```bash
pm2 start ecosystem.config.cjs
pm2 save
pm2 startup
```

## 7. Nginx

Файл: `deploy/nginx/indigo-snacks.conf`

Схема работы:

- `client/dist` раздается как статика
- `/api/*` проксируется на `127.0.0.1:4000`
- SPA маршруты уходят в `/index.html`
- ассеты кешируются

## 8. Локальный запуск

```bash
cp .env.example .env
npm install
npm run prisma:generate
npm run prisma:migrate
npm run seed
npm run dev:server
npm run dev:client
```

Фронтенд: `http://localhost:5173`

API: `http://localhost:4000/api`

## 9. Production build

```bash
cp .env.example .env
npm install
npm run prisma:generate
npm run prisma:migrate
npm run seed
npm run build
```

Результат:

- фронтенд: `client/dist`
- backend: `server/dist`

## 10. Деплой на Ubuntu 24.04 VPS

### Подготовка сервера

```bash
sudo apt update
sudo apt install -y nginx sqlite3 build-essential curl git ufw
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
sudo npm install -g pm2
```

### Развертывание проекта

```bash
sudo mkdir -p /var/www/indigo-snacks
sudo chown -R $USER:$USER /var/www/indigo-snacks
git clone <your-repo-url> /var/www/indigo-snacks
cd /var/www/indigo-snacks
cp .env.example .env
npm install
npm run prisma:generate
npm run prisma:migrate
npm run seed
npm run build
pm2 start ecosystem.config.cjs
pm2 save
```

Для production под домен `indigo-snacks.ru`:

```bash
cp .env.production.example .env
```

Проверь в `.env`:

- `NODE_ENV=production`
- `CLIENT_ORIGIN="https://indigo-snacks.ru"`

### Подключение Nginx

```bash
sudo cp deploy/nginx/indigo-snacks.conf /etc/nginx/sites-available/indigo-snacks.conf
sudo ln -s /etc/nginx/sites-available/indigo-snacks.conf /etc/nginx/sites-enabled/indigo-snacks.conf
sudo nginx -t
sudo systemctl reload nginx
```

Проверь, что DNS-записи домена уже указывают на IP VPS:

- `A` для `indigo-snacks.ru` -> `<VPS_IP>`
- `A` для `www.indigo-snacks.ru` -> `<VPS_IP>`

Nginx-конфиг уже содержит:

- `server_name indigo-snacks.ru`
- редирект `www.indigo-snacks.ru` -> `indigo-snacks.ru`

### Базовая безопасность

```bash
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable
chmod 600 .env
```

Рекомендуется дополнительно:

- включить HTTPS через `certbot`
- отключить root login по SSH
- использовать отдельного deploy-пользователя
- делать резервную копию файла SQLite
- мониторить `pm2 logs` и свободную память

Быстрое включение HTTPS (после настройки DNS):

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d indigo-snacks.ru -d www.indigo-snacks.ru
```

Для VPS `1 vCPU / 1 GB RAM / 10 GB SSD` рекомендуется добавить swap:

```bash
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

## 11. Комментарии по дальнейшему росту

- Реальную оплату подключать через `server/src/services/payment.service.ts`
- Реальную доставку подключать через `server/src/services/delivery.service.ts`
- Простую админку можно добавлять отдельным закрытым разделом на этом же API
- При росте нагрузки можно оставить фронтенд без изменений и перевести backend с SQLite на PostgreSQL

## 12. Замена изображений

Текущие брендовые placeholders лежат в:

- `client/public/assets/brand/dog-illustration.png`

Для замены на реальные фотографии достаточно:

1. положить новые файлы в `client/public/assets/brand`
2. обновить пути в `client/src/data/brand.ts` и seed-слое `server/src/db/catalog-seed.ts`, если нужен другой image для SKU
