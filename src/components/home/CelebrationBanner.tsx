import Link from "next/link";
import { celebrationBanner } from "@/data/home";

export function CelebrationBanner() {
  return (
    <section
      id="hampers"
      className="relative overflow-hidden border-y border-primary-container bg-cover bg-center py-10 text-white md:py-24"
      style={{ backgroundImage: `url("${celebrationBanner.backgroundImage}")` }}
    >
      <div className="absolute inset-0 bg-primary/75" />
      <div className="container-jj relative z-10 max-w-3xl text-center md:text-left">
        <span className="label-sm uppercase tracking-widest text-primary-fixed">
          {celebrationBanner.eyebrow}
        </span>
        <h2 className="font-display mt-2 text-2xl font-semibold leading-tight md:mt-3 md:text-5xl">
          <span className="md:hidden">{celebrationBanner.mobileTitle}</span>
          <span className="hidden md:inline">{celebrationBanner.title}</span>
        </h2>
        <p className="mt-2 text-sm leading-6 text-primary-fixed md:mt-4 md:leading-7 md:text-base">
          <span className="md:hidden">{celebrationBanner.mobileBody}</span>
          <span className="hidden md:inline">{celebrationBanner.body}</span>
        </p>
        <div className="mt-5 flex flex-col items-center gap-2.5 sm:flex-row md:mt-8 md:items-start md:gap-3">
          <Link
            href={celebrationBanner.primaryCta.href}
            className="inline-flex w-full min-w-0 items-center justify-center rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-primary transition hover:bg-primary-fixed sm:w-auto sm:min-w-50 md:px-6 md:py-3"
          >
            <span className="md:hidden">{celebrationBanner.primaryCta.mobileLabel}</span>
            <span className="hidden md:inline">{celebrationBanner.primaryCta.label}</span>
          </Link>
          <Link
            href={celebrationBanner.secondaryCta.href}
            className="hidden min-w-50 items-center justify-center rounded-lg border border-white/70 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10 sm:inline-flex"
          >
            {celebrationBanner.secondaryCta.label}
          </Link>
        </div>
      </div>
    </section>
  );
}
