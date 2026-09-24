/**
 * Shared hero-carousel frame for 16:9 promotional banners.
 * Keep mobile + desktop on the same ratio so baked-in copy/CTAs stay visible.
 */
export const HERO_BANNER_FRAME_CLASS =
  "relative aspect-video w-full overflow-hidden bg-surface";

/** Image fit: contain keeps full banner art; cream fill matches brand canvas. */
export const HERO_BANNER_IMAGE_CLASS =
  "object-contain object-center bg-surface";
