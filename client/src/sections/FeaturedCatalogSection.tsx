import type { Product } from '../types/api';
import { ProductCard } from '../components/ProductCard';
import { Container } from '../components/ui/Container';
import { SectionHeading } from '../components/ui/SectionHeading';

interface FeaturedCatalogSectionProps {
  products: Product[];
  isLoading: boolean;
  error: string | null;
}

export function FeaturedCatalogSection({
  products,
  isLoading,
  error
}: FeaturedCatalogSectionProps) {
  return (
    <section id="catalog" className="section-space">
      <Container>
        <SectionHeading
          eyebrow="Каталог"
          title="Сейчас в наличии"
          description="Три фасовки снеков из индейки: для знакомства с продуктом, регулярного использования и запаса на более долгий срок."
        />

        <div className="mt-8">
          {isLoading ? (
            <div className="glass-panel text-muted">Загружаем ассортимент...</div>
          ) : error ? (
            <div className="glass-panel text-red-700">{error}</div>
          ) : (
            <div className="grid gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </Container>
    </section>
  );
}
