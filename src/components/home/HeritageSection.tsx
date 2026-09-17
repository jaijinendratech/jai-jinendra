import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { heritage } from "@/data/home";

export function HeritageSection() {
  return (
    <section
      id="heritage"
      className="bg-surface-container-lowest py-8 md:py-24"
    >
      <div className="container-jj grid items-center gap-6 lg:grid-cols-2 lg:gap-16">
        <div className="relative">
          <div className="relative aspect-4/3 overflow-hidden rounded-xl bg-surface-container-low">
            <Image
              src={heritage.image}
              alt={heritage.imageAlt}
              fill
              sizes="(max-width:1024px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
          <div className="absolute -bottom-3 left-3 right-3 grid grid-cols-2 gap-2 md:-bottom-4 md:left-8 md:right-auto md:w-[320px] md:gap-3">
            {heritage.stats.map((stat) => (
              <div
                key={stat.value}
                className="rounded-xl border border-outline-variant/40 bg-surface-container-lowest/95 p-3 shadow-sm backdrop-blur md:p-4"
              >
                <p className="numeric text-xl font-bold text-primary md:text-2xl">
                  {stat.value}
                </p>
                <p className="mt-0.5 text-[11px] text-on-surface-variant md:mt-1 md:text-xs">
                  <span className="md:hidden">{stat.mobileLabel}</span>
                  <span className="hidden md:inline">{stat.label}</span>
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-6 lg:pt-0">
          <span className="label-sm font-bold uppercase tracking-widest text-primary">
            {heritage.eyebrow}
          </span>
          <h2 className="font-display mt-2 text-2xl font-semibold leading-tight text-on-surface md:text-4xl">
            <span className="md:hidden">{heritage.mobileTitle}</span>
            <span className="hidden md:inline">{heritage.title}</span>
          </h2>
          <p className="mt-3 text-sm leading-6 text-on-surface-variant md:mt-5 md:text-base md:leading-7">
            <span className="md:hidden">{heritage.mobileBody}</span>
            <span className="hidden md:inline">{heritage.body}</span>
          </p>
          <Link
            href={heritage.cta.href}
            className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary underline-offset-4 hover:underline md:mt-6"
          >
            <span className="md:hidden">{heritage.mobileCta}</span>
            <span className="hidden md:inline">{heritage.cta.label}</span>{" "}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
