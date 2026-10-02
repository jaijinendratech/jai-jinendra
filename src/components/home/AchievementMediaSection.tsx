import Image from "next/image";
import Link from "next/link";
import { ImageIcon } from "lucide-react";
import type { AchievementMedia, AchievementMediaItem } from "@/types/catalog";

const PLACEHOLDER_COUNT = 6;

function MediaTile({ item }: { item: AchievementMediaItem }) {
  return (
    <figure className="relative aspect-4/3 overflow-hidden rounded-xl bg-surface-container-low">
      <Image
        src={item.src}
        alt={item.alt}
        fill
        sizes="(max-width:768px) 75vw, 33vw"
        className="object-cover"
      />
    </figure>
  );
}

function PlaceholderTile() {
  return (
    <div
      aria-hidden
      className="flex aspect-4/3 items-center justify-center rounded-xl border border-dashed border-outline-variant/50 bg-surface-container-low"
    >
      <ImageIcon className="h-7 w-7 text-on-surface-variant/40 md:h-8 md:w-8" />
    </div>
  );
}

function galleryEntries(items: AchievementMediaItem[]) {
  const ready = items.filter((item) => item.src);
  if (ready.length > 0) {
    return ready.map((item) => ({
      key: item.id,
      tile: <MediaTile item={item} />,
    }));
  }
  return Array.from({ length: PLACEHOLDER_COUNT }, (_, index) => ({
    key: `placeholder-${index}`,
    tile: <PlaceholderTile />,
  }));
}

function MediaGallery({ items }: { items: AchievementMediaItem[] }) {
  const mobile = galleryEntries(items);
  const desktop = galleryEntries(items);

  return (
    <>
      <div className="-mx-1 flex gap-3 overflow-x-auto px-1 pb-1 md:hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {mobile.map((entry) => (
          <div key={entry.key} className="w-[72vw] max-w-80 shrink-0">
            {entry.tile}
          </div>
        ))}
      </div>
      <div className="hidden gap-4 md:grid md:grid-cols-3">
        {desktop.map((entry) => (
          <div key={entry.key}>{entry.tile}</div>
        ))}
      </div>
    </>
  );
}

export function AchievementMediaSection({
  content,
}: {
  content: AchievementMedia;
}) {
  return (
    <section className="bg-surface-container-lowest py-8 md:py-20">
      <div className="container-jj">
        <div className="mb-5 max-w-2xl md:mb-10">
          <span className="label-sm font-bold uppercase tracking-widest text-primary">
            {content.eyebrow}
          </span>
          <h2 className="font-display mt-1 text-xl font-semibold text-on-surface md:text-[32px] md:leading-10">
            {content.title}
          </h2>
          <p className="mt-1.5 text-sm leading-6 text-on-surface-variant md:mt-2 md:text-base md:leading-7">
            {content.body}
          </p>
        </div>

        <MediaGallery items={content.items} />

        <Link
          href="/achievement"
          className="mt-6 inline-flex items-center justify-center rounded-lg bg-primary-container px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary md:mt-8"
        >
          {content.ctaLabel || "See Achievements"}
        </Link>
      </div>
    </section>
  );
}
