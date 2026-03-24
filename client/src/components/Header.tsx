import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { BrandMark } from './BrandMark';
import { Container } from './ui/Container';
import { getButtonClassName } from './ui/Button';
import { cartSelectors, useCartStore } from '../store/cart';

const navItems = [
  { to: '/#about', label: 'О бренде' },
  { to: '/#catalog', label: 'Фасовки' },
  { to: '/catalog', label: 'Каталог' },
  { to: '/#subscription', label: 'Подписка' }
];

export function Header() {
  const itemCount = useCartStore((state) => cartSelectors.itemCount(state.items));
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-white/60 bg-bg/90 backdrop-blur-xl">
      <Container>
        <div className="flex min-h-16 items-center justify-between gap-3 sm:min-h-[4.5rem] sm:gap-4">
          <div className="min-w-0">
            <BrandMark compact />
          </div>

          <nav className="hidden items-center gap-8 lg:flex" aria-label="Основная навигация">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className="text-sm font-medium text-muted transition hover:text-ink"
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="hidden items-center gap-3 lg:flex">
            <Link to="/checkout" className="text-sm font-medium text-muted transition hover:text-ink">
              Корзина {itemCount > 0 ? `(${itemCount})` : ''}
            </Link>
            <Link
              to="/catalog"
              className={getButtonClassName({ variant: 'secondary', className: 'px-5' })}
            >
              Купить
            </Link>
          </div>

          <button
            type="button"
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-line bg-white/80 shadow-soft lg:hidden"
            onClick={() => setIsOpen((value) => !value)}
            aria-expanded={isOpen}
            aria-label="Открыть меню"
          >
            <span className="relative block h-3.5 w-[18px] text-ink" aria-hidden="true">
              {isOpen ? (
                <>
                  <span className="absolute left-0 top-1/2 h-[1.8px] w-[18px] -translate-y-1/2 rotate-45 rounded-full bg-current" />
                  <span className="absolute left-0 top-1/2 h-[1.8px] w-[18px] -translate-y-1/2 -rotate-45 rounded-full bg-current" />
                </>
              ) : (
                <>
                  <span className="absolute left-0 top-0 h-[1.8px] w-[18px] rounded-full bg-current" />
                  <span className="absolute left-0 top-1/2 h-[1.8px] w-[18px] -translate-y-1/2 rounded-full bg-current" />
                  <span className="absolute left-0 bottom-0 h-[1.8px] w-[18px] rounded-full bg-current" />
                </>
              )}
            </span>
          </button>
        </div>

        {isOpen ? (
          <div className="border-t border-line/70 py-4 lg:hidden">
            <nav className="flex flex-col gap-2" aria-label="Мобильная навигация">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className="rounded-2xl border border-transparent bg-white/55 px-4 py-3 text-sm font-medium text-muted transition hover:border-line/70 hover:bg-white/85 hover:text-ink"
                  onClick={() => setIsOpen(false)}
                >
                  {item.label}
                </NavLink>
              ))}
              <NavLink
                to="/checkout"
                className="rounded-2xl border border-transparent bg-white/55 px-4 py-3 text-sm font-medium text-muted transition hover:border-line/70 hover:bg-white/85 hover:text-ink"
                onClick={() => setIsOpen(false)}
              >
                Корзина {itemCount > 0 ? `(${itemCount})` : ''}
              </NavLink>
              <Link
                to="/catalog"
                className={getButtonClassName({ variant: 'secondary', className: 'mt-2 w-full justify-center' })}
                onClick={() => setIsOpen(false)}
              >
                Купить
              </Link>
            </nav>
          </div>
        ) : null}
      </Container>
    </header>
  );
}
