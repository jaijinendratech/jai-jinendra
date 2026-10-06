import Link from "next/link";
import { siteConfig } from "@/data/home";

export function AnnouncementBar() {
  return (
    <aside
      className="border-b border-black/10 px-4 py-1.5 text-sm text-white md:px-8 md:py-2 lg:px-10"
      style={{ backgroundColor: siteConfig.announcementColor }}
    >
      <div className="mx-auto flex w-full max-w-[min(90vw,1720px)] flex-col items-center justify-between gap-1.5 md:flex-row md:gap-2">
        <div className="flex items-center gap-2 text-center md:text-left">
          <span className="inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-secondary-fixed" />
          <p className="font-light text-[11px] tracking-wide md:text-xs">
            <span className="md:hidden">{siteConfig.announcementMobile}</span>
            <span className="hidden md:inline">{siteConfig.announcement}</span>
          </p>
        </div>
        <div className="hidden items-center gap-6 text-xs font-semibold tracking-wide text-white/90 md:flex">
          <Link
            href={`tel:${siteConfig.phone}`}
            className="transition hover:text-white"
          >
            Helpline: {siteConfig.phone}
          </Link>
          <span className="h-3 w-px bg-outline-variant/40" />
        </div>
      </div>
    </aside>
  );
}
