import { orderingSteps } from '../data/brand';
import { Container } from '../components/ui/Container';
import { SectionHeading } from '../components/ui/SectionHeading';
import { Reveal } from '../components/Reveal';
import { Tilt } from '../components/Tilt';

export function HowToOrderSection() {
  return (
    <section className="section-space">
      <Container>
        <SectionHeading
          eyebrow="Как заказать"
          title="Покупка в пару кликов"
          description="Мы сделали процесс простым: выбрали фасовку, добавили в заявку и согласовали детали с менеджером."
        />

        <div className="mt-8 grid gap-5 md:grid-cols-3 md:auto-rows-fr">
          {orderingSteps.map((item, index) => (
            <Reveal key={item.step} delay={index * 0.08} className="h-full">
              <Tilt className="group h-full" max={3.5} scale={1.01}>
                <article className="glass-panel flex h-full min-h-[15rem] flex-col p-6 shadow-soft transition-shadow duration-300 group-hover:shadow-lift sm:p-7">
                  <p className="font-display text-[3rem] leading-none text-brand/28 transition-colors duration-300 group-hover:text-brand/40 sm:text-[3.35rem]">
                    {item.step}
                  </p>
                  <h3 className="mt-3 min-h-[3.15rem] text-[2rem] font-semibold leading-[0.96] text-ink sm:text-[2.15rem]">
                    {item.title}
                  </h3>
                  <p className="mt-3 text-[1.02rem] leading-7 text-muted">{item.text}</p>
                </article>
              </Tilt>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
