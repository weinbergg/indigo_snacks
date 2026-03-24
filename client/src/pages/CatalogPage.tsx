import { Container } from '../components/ui/Container';
import { SectionHeading } from '../components/ui/SectionHeading';
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
    <section className="py-16 sm:py-20">
      <Container>
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
