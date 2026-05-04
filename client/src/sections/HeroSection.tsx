import { motion, useReducedMotion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { heroStats } from '../data/brand';
import { Container } from '../components/ui/Container';
import { getButtonClassName } from '../components/ui/Button';
import { Reveal } from '../components/Reveal';
import { BrandDogBadge } from '../components/BrandDogBadge';

export function HeroSection() {
  const reduceMotion = useReducedMotion();

  return (
    <section className="section-space-hero overflow-hidden">
      <Container>
        <div className="grid items-center gap-10 lg:grid-cols-[1.08fr_0.92fr] lg:gap-12">
          <div>
            <Reveal>
              <p className="mb-5 text-xs font-semibold uppercase tracking-[0.38em] text-brand">
                Индиго Снэкс
              </p>
              <h1 className="max-w-3xl font-display text-4xl leading-[0.98] text-ink sm:text-6xl lg:text-7xl">
                Снеки из индейки
                <span className="block text-brand">для спокойной ежедневной заботы</span>
              </h1>
              <p className="mt-6 max-w-2xl text-base leading-7 text-muted sm:text-lg sm:leading-8 lg:text-xl">
                Натуральное лакомство для собак с чистым составом, деликатной текстурой и
                лаконичной подачей. Один понятный продукт, который легко выбрать и приятно
                держать дома.
              </p>
              <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                <Link to="/catalog" className={getButtonClassName({ variant: 'primary' })}>
                  Выбрать упаковку
                </Link>
                <Link to="/#lead-form" className={getButtonClassName({ variant: 'secondary' })}>
                  Задать вопрос
                </Link>
              </div>
            </Reveal>

            <div className="mt-10 grid gap-4 sm:grid-cols-3 sm:auto-rows-fr">
              {heroStats.map((item, index) => (
                <Reveal key={item.label} delay={0.08 * (index + 1)} className="h-full">
                  <motion.article
                    initial={reduceMotion ? { scale: 1 } : { scale: 0.96 }}
                    whileInView={reduceMotion ? undefined : { scale: [0.96, 1.02, 1] }}
                    transition={{
                      duration: reduceMotion ? 0.25 : 0.6,
                      ease: [0.22, 1, 0.36, 1]
                    }}
                    viewport={{ once: true, amount: 0.5 }}
                    className="flex h-full min-h-[10rem] flex-col justify-between rounded-[1.7rem] border border-line/70 bg-white p-5 text-left shadow-soft sm:p-6"
                  >
                    <p className="max-w-[10ch] text-balance font-display text-[1.7rem] leading-[0.94] tracking-[-0.03em] text-ink sm:text-[1.8rem] lg:text-[2rem]">
                      {item.value}
                    </p>
                    <p className="mt-5 max-w-[12ch] text-sm uppercase leading-6 tracking-[0.16em] text-muted">
                      {item.label}
                    </p>
                  </motion.article>
                </Reveal>
              ))}
            </div>
          </div>

          <Reveal delay={0.08}>
            <div className="group relative mx-auto flex w-full max-w-[23rem] items-center justify-center sm:max-w-[29rem] lg:max-w-[34rem]">
              <div className="absolute inset-0 rounded-full border border-white/85 transition duration-300 group-hover:scale-[1.02]" />
              <div className="absolute inset-3 rounded-full border border-white/46 transition duration-300 group-hover:scale-[1.01]" />
              <div className="absolute inset-6 rounded-full border border-white/24 transition duration-300" />
              <div className="relative w-full">
                <div className="relative rounded-full bg-[#d6e7e2] p-4 shadow-lift transition duration-300 group-hover:shadow-[0_28px_80px_rgba(18,84,86,0.18)] sm:p-6">
                  <motion.div
                    className="relative z-10 mx-auto aspect-square w-full max-w-[30rem]"
                    whileHover={reduceMotion ? undefined : { scale: 1.045 }}
                    transition={{ type: 'spring', stiffness: 260, damping: 22 }}
                  >
                    <BrandDogBadge
                      className="h-full w-full"
                      shapeInsetClassName="inset-[7.4%] -translate-y-[3.8%]"
                      fillClassName="bg-[#d6e7e2]"
                      frameClassName="inset-[8%] -translate-y-[1.6%] opacity-85"
                      alt="Фирменная графичная собака бренда Индиго"
                    />
                  </motion.div>
                </div>
                <div className="pointer-events-none absolute left-1/2 top-[76.5%] z-20 -translate-x-1/2">
                  <span className="inline-flex whitespace-nowrap rounded-full border border-white/75 bg-[rgba(255,251,245,0.82)] px-4 py-1.5 text-center font-display text-[1.12rem] uppercase leading-none tracking-[0.14em] text-brand-deep/85 shadow-[0_18px_42px_rgba(18,84,86,0.1)] backdrop-blur-sm sm:px-7 sm:py-2.5 sm:text-[2.08rem] lg:text-[2.7rem]">
                    Индиго Снэкс
                  </span>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
