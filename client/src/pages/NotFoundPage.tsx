import { Link } from 'react-router-dom';
import { Container } from '../components/ui/Container';
import { getButtonClassName } from '../components/ui/Button';
import { usePageMeta } from '../hooks/usePageMeta';

export default function NotFoundPage() {
  usePageMeta('Страница не найдена | Индиго Снэкс', 'Запрошенная страница отсутствует.');

  return (
    <section className="py-20">
      <Container>
        <div className="glass-panel mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.34em] text-brand">404</p>
          <h1 className="mt-4 font-display text-5xl text-ink">Страница не найдена</h1>
          <p className="mt-4 text-base leading-7 text-muted">
            Проверьте адрес или вернитесь на главную страницу бренда Индиго.
          </p>
          <div className="mt-8">
            <Link to="/" className={getButtonClassName({ variant: 'primary' })}>
              На главную
            </Link>
          </div>
        </div>
      </Container>
    </section>
  );
}
