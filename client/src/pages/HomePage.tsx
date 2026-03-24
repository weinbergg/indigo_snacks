import { useProducts } from '../hooks/useProducts';
import { usePageMeta } from '../hooks/usePageMeta';
import { AboutSection } from '../sections/AboutSection';
import { BenefitsSection } from '../sections/BenefitsSection';
import { FeaturedCatalogSection } from '../sections/FeaturedCatalogSection';
import { GallerySection } from '../sections/GallerySection';
import { HeroSection } from '../sections/HeroSection';
import { HowToOrderSection } from '../sections/HowToOrderSection';
import { LeadSection } from '../sections/LeadSection';
import { SubscriptionSection } from '../sections/SubscriptionSection';

export default function HomePage() {
  const { products, isLoading, error } = useProducts();

  usePageMeta(
    'Индиго Снэкс | Натуральные снеки из индейки для собак',
    'Индиго Снэкс — натуральные снеки из индейки для собак в фасовках 50, 100 и 500 г: удобный заказ и спокойная подача бренда.'
  );

  return (
    <>
      <HeroSection />
      <BenefitsSection />
      <AboutSection />
      <FeaturedCatalogSection products={products} isLoading={isLoading} error={error} />
      <HowToOrderSection />
      <SubscriptionSection products={products} />
      <GallerySection />
      <LeadSection />
    </>
  );
}
