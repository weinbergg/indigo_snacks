import { Container } from '../components/ui/Container';
import { SectionHeading } from '../components/ui/SectionHeading';
import { usePageMeta } from '../hooks/usePageMeta';

export default function TermsPage() {
  usePageMeta(
    'Пользовательское соглашение | Индиго Снэкс',
    'Базовые условия использования сайта Индиго и оформления заявок.'
  );

  return (
    <section className="py-16 sm:py-20">
      <Container>
        <div className="mx-auto max-w-4xl rounded-[2rem] border border-line/70 bg-white/80 p-8 shadow-soft">
          <SectionHeading
            eyebrow="Документ"
            title="Пользовательское соглашение"
            description="Настоящее соглашение определяет порядок использования сайта Индиго и оформления заказов через каталог, корзину и формы обратной связи."
          />

          <div className="mt-10 space-y-6 text-base leading-8 text-muted">
            <p>
              1. Сайт предоставляет информацию о продукции Индиго и позволяет оформить заказ,
              оставить обращение или запрос на регулярную поставку.
            </p>
            <p>
              2. Пользователь обязуется указывать корректные данные для связи и доставки, чтобы
              заказ мог быть подтвержден и обработан без задержек.
            </p>
            <p>
              3. Информация о товаре, цене, наличии и способах доставки может обновляться.
              Итоговые условия заказа подтверждаются после обработки заявки.
            </p>
            <p>
              4. Использование сайта означает согласие пользователя с настоящими условиями и
              с обработкой персональных данных в объеме, необходимом для обратной связи и
              выполнения заказа.
            </p>
          </div>
        </div>
      </Container>
    </section>
  );
}
