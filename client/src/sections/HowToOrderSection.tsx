import { orderingSteps } from '../data/brand';
import { Container } from '../components/ui/Container';
import { SectionHeading } from '../components/ui/SectionHeading';
import { Reveal } from '../components/Reveal';

export function HowToOrderSection() {
  return (
    <section className="section-space">
      <Container>
        <SectionHeading
          eyebrow="Как заказать"
          title="Оформление без лишних шагов"
          description="Мы сделали заказ простым: выбрали упаковку, указали адрес, подтвердили детали и спокойно ждете доставку."
        />

        <div className="mt-8 grid gap-5 md:grid-cols-3 md:auto-rows-fr">
          {orderingSteps.map((item, index) => (
            <Reveal key={item.step} delay={index * 0.08} className="h-full">
              <article className="glass-panel interactive-panel flex h-full min-h-[15.5rem] flex-col">
                <p className="font-display text-5xl text-brand/30">{item.step}</p>
                <h3 className="mt-4 min-h-[3.5rem] text-2xl font-semibold leading-[1.08] text-ink">
                  {item.title}
                </h3>
                <p className="mt-3 text-base leading-7 text-muted">{item.text}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
