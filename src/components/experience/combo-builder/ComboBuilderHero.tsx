import { PageHeroCarousel } from "@/components/shared/PageHeroCarousel";
import { comboBuilderHeroSlides, comboBuilderMeta } from "@/data/combo-builder";

export function ComboBuilderHero() {
  return (
    <PageHeroCarousel
      slides={comboBuilderHeroSlides}
      label={comboBuilderMeta.heroTitle}
      showNavButtons={false}
    />
  );
}
