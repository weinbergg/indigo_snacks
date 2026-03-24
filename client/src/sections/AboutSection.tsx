import { Container } from '../components/ui/Container';
import { Reveal } from '../components/Reveal';

export function AboutSection() {
  return (
    <section className="section-space">
      <Container>
        <div className="grid gap-7 rounded-[2rem] border border-line/70 bg-white/70 p-7 shadow-soft lg:grid-cols-[1fr_0.9fr] lg:p-10">
          <Reveal>
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-brand">
              О продукте
            </p>
            <h2 className="mt-4 font-display text-4xl text-ink sm:text-5xl">
              Лакомство, в котором все просто и на своем месте
            </h2>
            <p className="mt-5 max-w-2xl text-base leading-8 text-muted">
              Снеки Индиго сделаны из индейки и рассчитаны на повседневное поощрение:
              дома, на прогулке или в дороге. Фасовки 50 г, 100 г и 500 г позволяют
              выбрать формат под первый заказ, спокойный недельный запас или регулярное использование.
            </p>
            <p className="mt-4 max-w-2xl text-base leading-8 text-muted">
              Нам близок спокойный подход к продукту: понятный состав, деликатная фактура,
              аккуратная упаковка и ощущение вещи, которую выбирают осознанно.
            </p>
          </Reveal>

          <Reveal delay={0.08}>
            <div className="grid gap-4 sm:grid-cols-[1.05fr_0.95fr]">
              <div className="interactive-panel group overflow-hidden rounded-[1.8rem] border border-line/70 bg-brand-soft/35">
                <img
                  src="/assets/brand/product-pack.jpeg"
                  alt="Пакет снеков Индиго из индейки"
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                  loading="lazy"
                />
              </div>
              <div className="space-y-4">
                <div className="interactive-panel group overflow-hidden rounded-[1.8rem] border border-line/70 bg-brand-soft/30">
                  <img
                    src="/assets/brand/product-closeup.jpeg"
                    alt="Ломтики индейки крупным планом"
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                    loading="lazy"
                  />
                </div>
                <div className="rounded-[1.8rem] border border-line/70 bg-brand-deep p-6 text-white">
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/65">
                    Сейчас в наличии
                  </p>
                  <p className="mt-3 font-display text-3xl">50 / 100 / 500 г</p>
                  <p className="mt-3 text-sm leading-7 text-white/75">
                    Линейка начинается от 250 ₽ и позволяет выбрать свой ритм покупки.
                  </p>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
