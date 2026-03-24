import { Link } from 'react-router-dom';
import { BrandMark } from './BrandMark';
import { Container } from './ui/Container';
import { legalNotice } from '../data/brand';

export function Footer() {
  return (
    <footer className="border-t border-line/70 bg-white/55 py-10">
      <Container>
        <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr_1fr]">
          <div className="space-y-4">
            <BrandMark />
            <p className="max-w-md text-sm leading-6 text-muted">
              Индиго Снэкс. Натуральные снеки из индейки для собак с лаконичной подачей,
              чистым составом и спокойным повседневным ритмом.
            </p>
            <p className="max-w-md text-sm leading-6 text-muted">{legalNotice}</p>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-[0.22em] text-brand">Разделы</h3>
            <div className="mt-4 flex flex-col gap-3 text-sm text-muted">
              <Link to="/catalog" className="transition hover:text-ink">
                Каталог
              </Link>
              <Link to="/checkout" className="transition hover:text-ink">
                Корзина и заказ
              </Link>
              <Link to="/#subscription" className="transition hover:text-ink">
                Подписка
              </Link>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-[0.22em] text-brand">Документы</h3>
            <div className="mt-4 flex flex-col gap-3 text-sm text-muted">
              <Link to="/privacy" className="transition hover:text-ink">
                Политика конфиденциальности
              </Link>
              <Link to="/terms" className="transition hover:text-ink">
                Пользовательское соглашение
              </Link>
            </div>
          </div>
        </div>
      </Container>
    </footer>
  );
}
