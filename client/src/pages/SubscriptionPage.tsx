import { Link } from 'react-router-dom';
import { Container } from '../components/ui/Container';
import { BackLink } from '../components/BackLink';
import { SubscriptionSection } from '../sections/SubscriptionSection';
import { usePageMeta } from '../hooks/usePageMeta';
import { useProducts } from '../hooks/useProducts';

export default function SubscriptionPage() {
  const { products } = useProducts();

  usePageMeta(
    'Подписка | Индиго Снэкс',
    'Регулярные заказы Индиго: соберите фасовки, выберите ритм поставок и оставьте запрос.'
  );

  return (
    <div className="pt-10 sm:pt-14">
      <Container>
        <div className="mb-2 flex flex-wrap items-center justify-between gap-4">
          <BackLink />
          <Link
            to="/catalog"
            className="text-sm font-medium text-brand transition hover:text-ink"
          >
            Перейти в каталог
          </Link>
        </div>
      </Container>

      <SubscriptionSection products={products} />
    </div>
  );
}
