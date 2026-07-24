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
    strokeWidth: 2
  };

  switch (icon) {
    case 'leaf':
      return (
        <svg viewBox="0 0 24 24" className="h-7 w-7" aria-hidden="true">
          <path {...commonProps} d="M6.2 14.3C6.8 9.2 10.5 6 17.8 5.8c-.4 6.9-3.9 10.8-8.5 11.6" />
          <path {...commonProps} d="M7.4 17.1c1.8-2.9 4.2-5.2 7.4-7" />
        </svg>
      );
    case 'price':
      return (
        <svg viewBox="0 0 24 24" className="h-7 w-7" aria-hidden="true">
          <path {...commonProps} d="M7.7 6.8h6.8l3.8 3.8-7.9 7.9-3.7-3.7V7.9a1.1 1.1 0 0 1 1-1.1Z" />
          <circle cx="12.1" cy="10.3" r="1.25" {...commonProps} />
        </svg>
      );
    case 'order':
      return (
        <svg viewBox="0 0 24 24" className="h-7 w-7" aria-hidden="true">
          <path {...commonProps} d="M6.8 8.3h10.4l-1.1 9H7.9z" />
          <path {...commonProps} d="M9.3 8.3a2.7 2.7 0 1 1 5.4 0" />
          <path {...commonProps} d="M9.8 13l2.1 2.1 3.3-4.1" />
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
                  <span className="row-span-3 flex h-[4.6rem] w-[4.6rem] items-center justify-center self-center justify-self-end rounded-[1.45rem] border border-brand/18 bg-gradient-to-b from-brand-soft/80 to-white text-brand/90 shadow-[0_8px_24px_rgba(18,84,86,0.08)] sm:h-20 sm:w-20">
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
