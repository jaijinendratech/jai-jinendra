import Link from "next/link";
import { siteConfig } from "@/data/home";

export function AnnouncementBar() {
  return (
    <aside className="border-b border-primary-container bg-primary px-4 py-1.5 text-sm text-on-primary md:px-8 md:py-2 lg:px-10">
      <div className="mx-auto flex w-full max-w-[min(90vw,1720px)] flex-col items-center justify-between gap-1.5 md:flex-row md:gap-2">
        <div className="flex items-center gap-2 text-center md:text-left">
          <span className="inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-secondary-fixed" />
          <p className="font-light text-[11px] tracking-wide md:text-xs">
            <span className="md:hidden">{siteConfig.announcementMobile}</span>
            <span className="hidden md:inline">{siteConfig.announcement}</span>
          </p>
        </div>
        <div className="hidden items-center gap-6 text-xs font-semibold tracking-wide text-primary-fixed md:flex">
          <Link
            href={`tel:${siteConfig.phone}`}
            className="transition hover:text-on-primary"
          >
            Helpline: {siteConfig.phone}
          </Link>
          <span className="h-3 w-px bg-outline-variant/40" />
          <span>Deliver to: Mumbai 400001</span>
          <span className="h-3 w-px bg-outline-variant/40" />
          <span className="font-semibold text-white">₹ INR</span>
        </div>
      </div>
    </aside>
  );
}
