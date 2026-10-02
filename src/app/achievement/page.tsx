import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { siteConfig } from "@/data/home";
import { getAchievementPageContent } from "@/lib/admin/queries";

const fallbackTitle = "Achievement";
const fallbackDescription = `Milestones, recognition, and customer trust highlights from ${siteConfig.name}.`;

export async function generateMetadata(): Promise<Metadata> {
  const content = await getAchievementPageContent();
  return {
    title: content.intro?.title?.trim() || fallbackTitle,
    description: content.intro?.body?.trim() || fallbackDescription,
    alternates: { canonical: "/achievement" },
  };
}

export default async function AchievementPage() {
  const content = await getAchievementPageContent();
  const title = content.intro?.title?.trim() || fallbackTitle;
  const body = content.intro?.body?.trim() || fallbackDescription;

  return (
    <main className="container-jj py-6 md:py-10">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "About us", href: "/about" },
          { label: "Achievement" },
        ]}
      />

      <p className="label-sm uppercase tracking-widest text-primary">Achievement</p>
      <h1 className="font-display mt-2 text-3xl font-semibold text-on-surface md:text-4xl">
        {title}
      </h1>
      <p className="mt-4 max-w-3xl text-sm leading-7 text-on-surface-variant md:text-base">
        {body}
      </p>

      <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {(content.items ?? []).map((item) => (
          <li
            key={item.id}
            className="overflow-hidden rounded-xl border border-outline-variant/25 bg-surface-container-lowest shadow-sm"
          >
            {item.imageUrl ? (
              <div className="relative aspect-16/10 bg-surface-container-low">
                <Image
                  src={item.imageUrl}
                  alt={item.title}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover"
                />
              </div>
            ) : null}
            <div className="p-5">
              {item.year ? (
                <p className="numeric text-sm font-bold text-primary">{item.year}</p>
              ) : null}
              <h2
                className={`font-display text-lg font-semibold text-on-surface${item.year ? " mt-1" : ""}`}
              >
                {item.title}
              </h2>
              <p className="mt-2 text-sm leading-6 text-on-surface-variant">{item.description}</p>
            </div>
          </li>
        ))}
      </ul>

      <div className="mt-10 flex flex-wrap gap-3">
        <Link
          href="/about"
          className="inline-flex rounded-lg bg-primary-container px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary"
        >
          About us
        </Link>
        <Link
          href="/outlets"
          className="inline-flex rounded-lg border border-primary-container px-5 py-2.5 text-sm font-semibold text-primary hover:bg-primary/5"
        >
          Our outlets
        </Link>
      </div>
    </main>
  );
}
