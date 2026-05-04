import { galleryItems } from '../data/brand';
import { Container } from '../components/ui/Container';
import { SectionHeading } from '../components/ui/SectionHeading';
import { Reveal } from '../components/Reveal';

export function GallerySection() {
  return (
    <section className="section-space">
      <Container>
        <SectionHeading
          eyebrow="В кадре"
          title="Спокойная подача, натуральная фактура, узнаваемая упаковка"
          description="Индиго выглядит так же сдержанно и аккуратно, как ощущается в повседневной заботе о собаке."
        />

        <div className="mt-8 grid gap-5 md:grid-cols-3 md:auto-rows-fr">
          {galleryItems.map((item, index) => (
            <Reveal key={item.caption} delay={index * 0.08} className="h-full">
              <figure className="interactive-panel group relative flex h-full flex-col overflow-hidden rounded-[1.8rem] border border-line/70 bg-white/80 p-5 sm:p-6">
                <div className="flex aspect-[4/3.05] items-center justify-center overflow-hidden rounded-[1.4rem] bg-brand-soft/50 p-3 sm:aspect-[4/3.25] sm:p-4 md:aspect-[4/4.6]">
                  <img
                    src={item.src}
                    alt={item.alt}
                    className="h-full w-full rounded-[1.15rem] object-contain transition duration-500 group-hover:scale-[1.02]"
                    style={{ objectPosition: item.position }}
                    loading="lazy"
                  />
                </div>
                <figcaption className="mt-5 px-1 pb-1 text-lg font-medium leading-[1.5] text-ink sm:text-[1.35rem]">
                  {item.caption}
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
