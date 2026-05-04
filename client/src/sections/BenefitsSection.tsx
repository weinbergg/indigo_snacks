import { benefits } from '../data/brand';
import { Reveal } from '../components/Reveal';
import { SectionHeading } from '../components/ui/SectionHeading';
import { Container } from '../components/ui/Container';

type BenefitIconName = (typeof benefits)[number]['icon'];

function BenefitIcon({ icon }: { icon: BenefitIconName }) {
  const commonProps = {
    fill: 'none',
    stroke: 'currentColor',
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    strokeWidth: 1.7
  };

  switch (icon) {
    case 'leaf':
      return (
        <svg viewBox="0 0 24 24" className="h-9 w-9" aria-hidden="true">
          <path {...commonProps} d="M6.5 13.5C6.8 9 10.5 5.8 17.5 5.5c-.3 6.7-3.5 10.5-8 11" />
          <path {...commonProps} d="M7.5 16.5c1.6-2.7 4-5.1 7.2-7" />
        </svg>
      );
    case 'price':
      return (
        <svg viewBox="0 0 24 24" className="h-9 w-9" aria-hidden="true">
          <path {...commonProps} d="M8 7h6.6l3.4 3.4-7.3 7.3L7 14.1V8a1 1 0 0 1 1-1Z" />
          <circle cx="12" cy="10.2" r="1.2" {...commonProps} />
        </svg>
      );
    case 'order':
      return (
        <svg viewBox="0 0 24 24" className="h-9 w-9" aria-hidden="true">
          <path {...commonProps} d="M7 8.5h10l-1 9H8z" />
          <path {...commonProps} d="M9.5 8.5a2.5 2.5 0 1 1 5 0" />
          <path {...commonProps} d="M10 13l2 2 3-4" />
        </svg>
      );
  }
}

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
              <article className="glass-panel interactive-panel flex h-full min-h-[14.25rem] flex-col p-6 text-left sm:p-7">
                <div className="grid h-full grid-cols-[minmax(0,1fr)_4.5rem] gap-x-5 gap-y-3 sm:grid-cols-[minmax(0,1fr)_5rem]">
                  <p className="font-display text-[2.9rem] leading-none text-brand/28 sm:text-[3.25rem]">
                    0{index + 1}
                  </p>
                  <span className="row-span-3 flex h-[4.5rem] w-[4.5rem] self-center justify-self-end rounded-[1.45rem] border border-brand/12 bg-brand-soft/60 text-brand/85 sm:h-20 sm:w-20">
                    <BenefitIcon icon={benefit.icon} />
                  </span>
                  <h3 className="max-w-[10ch] text-[2rem] font-semibold leading-[0.96] text-ink sm:text-[2.15rem]">
                    {benefit.title}
                  </h3>
                  <p className="max-w-[27ch] text-[1.02rem] leading-7 text-muted">
                    {benefit.text}
                  </p>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
