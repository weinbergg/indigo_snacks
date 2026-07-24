import { Leaf, BadgePercent, PackageCheck } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { benefits } from '../data/brand';
import { Reveal } from '../components/Reveal';
import { Tilt } from '../components/Tilt';
import { SectionHeading } from '../components/ui/SectionHeading';
import { Container } from '../components/ui/Container';

type BenefitIconName = (typeof benefits)[number]['icon'];

const benefitIcons: Record<BenefitIconName, LucideIcon> = {
  leaf: Leaf,
  price: BadgePercent,
  order: PackageCheck
};

function BenefitIcon({ icon }: { icon: BenefitIconName }) {
  const Icon = benefitIcons[icon];
  return <Icon className="h-9 w-9 sm:h-10 sm:w-10" strokeWidth={1.7} aria-hidden="true" />;
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
              <Tilt className="group h-full" max={3.5} scale={1.01}>
                <article className="glass-panel flex h-full min-h-[14.25rem] flex-col p-6 text-left shadow-soft transition-shadow duration-300 group-hover:shadow-lift sm:p-7">
                  <div className="grid h-full grid-cols-[minmax(0,1fr)_5rem] gap-x-5 gap-y-3 sm:grid-cols-[minmax(0,1fr)_5.5rem]">
                    <p className="font-display text-[2.9rem] leading-none text-brand/28 transition-colors duration-300 group-hover:text-brand/40 sm:text-[3.25rem]">
                      0{index + 1}
                    </p>
                    <span className="row-span-3 flex h-[4.5rem] w-[4.5rem] items-center justify-center self-center justify-self-end rounded-[1.3rem] border border-brand/18 bg-gradient-to-b from-brand-soft/80 to-white text-brand/90 shadow-[0_8px_24px_rgba(18,84,86,0.08)] transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:rotate-[-4deg] sm:h-20 sm:w-20">
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
              </Tilt>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
