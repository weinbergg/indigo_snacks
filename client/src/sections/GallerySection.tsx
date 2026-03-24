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
              <figure className="interactive-panel group relative flex h-full flex-col overflow-hidden rounded-[1.8rem] border border-line/70 bg-white/75 p-4">
                <div className="overflow-hidden rounded-[1.4rem] bg-brand-soft/50">
                  <img
                    src={item.src}
                    alt={item.alt}
                    className="aspect-[4/5] w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                    style={{ objectPosition: item.position }}
                    loading="lazy"
                  />
                </div>
                <figcaption className="mt-4 text-sm text-muted">{item.caption}</figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
