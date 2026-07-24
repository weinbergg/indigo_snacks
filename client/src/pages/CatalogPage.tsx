import { Link } from 'react-router-dom';
import { Container } from '../components/ui/Container';
import { SectionHeading } from '../components/ui/SectionHeading';
import { BackLink } from '../components/BackLink';
import { getButtonClassName } from '../components/ui/Button';
import { usePageMeta } from '../hooks/usePageMeta';
import { useProducts } from '../hooks/useProducts';
import { ProductCard } from '../components/ProductCard';

export default function CatalogPage() {
  const { products, isLoading, error } = useProducts();

  usePageMeta(
    'Каталог | Индиго Снэкс',
    'Каталог Индиго: снеки из индейки в фасовках 50, 100 и 500 грамм.'
  );

  return (
    <section className="pb-16 pt-10 sm:pb-24 sm:pt-14">
      <Container>
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <BackLink />
          <Link
            to="/subscription"
            className={getButtonClassName({ variant: 'ghost', className: 'px-4' })}
          >
            Регулярные заказы
          </Link>
        </div>

        <SectionHeading
          eyebrow="Каталог"
          title="Снеки из индейки"
          description="Сейчас доступны фасовки 50 г, 100 г и 500 г. Можно выбрать компактный формат для знакомства с продуктом или запас на регулярные заказы."
        />

        <div className="mt-10 grid gap-6">
          {isLoading ? (
            <div className="glass-panel text-muted">Загружаем каталог...</div>
          ) : error ? (
            <div className="glass-panel text-red-700">{error}</div>
          ) : (
            products.map((product) => <ProductCard key={product.id} product={product} />)
          )}
        </div>
      </Container>
    </section>
  );
}
