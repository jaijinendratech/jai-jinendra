"use client";

import dynamic from "next/dynamic";

// The popup is closed on the server render, so defer its HeroUI Modal bundle
// until after hydration instead of shipping it in the critical path.
const OfferPopup = dynamic(
  () => import("@/components/layout/OfferPopup").then((m) => m.OfferPopup),
  { ssr: false },
);

export function OfferPopupLazy() {
  return <OfferPopup />;
}
