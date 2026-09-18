import { PageHeroCarousel } from "@/components/shared/PageHeroCarousel";
import { comboBuilderHeroSlides, comboBuilderMeta } from "@/data/combo-builder";
import type { ExperienceSlide } from "@/data/experience-pages";

export function ComboBuilderHero({
  slides,
}: {
  slides?: readonly ExperienceSlide[];
}) {
  const carouselSlides = slides?.length ? slides : comboBuilderHeroSlides;

  return (
    <PageHeroCarousel
      slides={carouselSlides}
      label={comboBuilderMeta.heroTitle}
      showNavButtons={false}
    />
  );
}
