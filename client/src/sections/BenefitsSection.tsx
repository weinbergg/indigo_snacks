import { benefits } from '../data/brand';
import { Reveal } from '../components/Reveal';
import { SectionHeading } from '../components/ui/SectionHeading';
import { Container } from '../components/ui/Container';

export function BenefitsSection() {
  return (
    <section id="about" className="section-space">
      <Container>
        <SectionHeading
          eyebrow="Почему выбирают Индиго"
          title="Бренд, к которому легко привыкнуть"
          description="Индиго задуман как натуральный, доступный и удобный бренд для повседневной заботы о собаке."
        />

        <div className="mt-8 grid gap-5 md:grid-cols-3 md:auto-rows-fr">
          {benefits.map((benefit, index) => (
            <Reveal key={benefit.title} delay={index * 0.07} className="h-full">
              <article className="glass-panel interactive-panel flex h-full min-h-[15.5rem] flex-col text-left">
                <p className="text-xs font-semibold uppercase tracking-[0.26em] text-brand">
                  0{index + 1}
                </p>
                <h3 className="mt-4 min-h-[3.5rem] max-w-[14ch] text-2xl font-semibold leading-[1.08] text-ink">
                  {benefit.title}
                </h3>
                <p className="mt-3 max-w-[30ch] text-base leading-7 text-muted">{benefit.text}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
