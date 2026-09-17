import Image from "next/image";
import Link from "next/link";
import { catalogueMeta } from "@/data/catalogue";

export function CatalogueGiftBanner() {
  const banner = catalogueMeta.giftBanner;

  return (
    <div className="relative my-5 flex flex-col items-center justify-between gap-4 overflow-hidden rounded-xl bg-linear-to-r from-primary-container via-primary to-tertiary-container p-4 text-white shadow-md md:my-8 md:flex-row md:gap-6 md:p-8">
      <div className="relative z-10 max-w-xl">
        <span className="label-sm mb-1 block uppercase tracking-widest text-primary-fixed">
          {banner.eyebrow}
        </span>
        <h2 className="font-display text-lg font-bold md:text-2xl">
          <span className="md:hidden">{banner.mobileTitle}</span>
          <span className="hidden md:inline">{banner.title}</span>
        </h2>
        <p className="mt-1.5 text-sm text-primary-fixed-dim md:mt-2 md:text-base">
          <span className="md:hidden">{banner.mobileBody}</span>
          <span className="hidden md:inline">{banner.body}</span>
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-3 md:mt-4">
          <Link
            href={banner.cta.href}
            className="rounded bg-white px-4 py-2 text-xs font-semibold text-primary shadow transition hover:bg-surface-container"
          >
            <span className="md:hidden">{banner.cta.mobileLabel}</span>
            <span className="hidden md:inline">{banner.cta.label}</span>
          </Link>
          <span className="hidden text-xs text-surface-container-high md:inline">
            {banner.note}
          </span>
        </div>
      </div>
      <div className="relative z-10 hidden h-36 w-full shrink-0 overflow-hidden rounded-lg border border-white/20 shadow-inner md:block md:w-56">
        <Image
          src={banner.image}
          alt={banner.imageAlt}
          fill
          sizes="224px"
          className="object-cover"
        />
      </div>
    </div>
  );
}
