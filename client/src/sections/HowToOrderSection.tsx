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
              <article className="glass-panel interactive-panel flex h-full min-h-[15rem] flex-col p-6 sm:p-7">
                <p className="font-display text-[3rem] leading-none text-brand/28 sm:text-[3.35rem]">
                  {item.step}
                </p>
                <h3 className="mt-3 min-h-[3.15rem] text-[2rem] font-semibold leading-[0.96] text-ink sm:text-[2.15rem]">
                  {item.title}
                </h3>
                <p className="mt-3 text-[1.02rem] leading-7 text-muted">{item.text}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
