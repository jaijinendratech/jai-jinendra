import Image from "next/image";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import type { InstagramPost } from "@/types/catalog";

export function InstagramSection({ posts }: { posts: InstagramPost[] }) {
  const mobilePosts = posts.slice(0, 4);

  return (
    <section className="border-t border-outline-variant/30 bg-surface-container-low py-8 md:py-20">
      <div className="container-jj">
        <div className="mb-5 flex flex-col items-start justify-between gap-3 md:mb-8 md:flex-row md:items-end md:gap-4">
          <div>
            <span className="label-sm font-bold uppercase tracking-widest text-primary">
              Community & Traditions
            </span>
            <h2 className="font-display mt-1 text-xl font-semibold text-on-surface md:text-[32px]">
              <span className="md:hidden">Follow Us</span>
              <span className="hidden md:inline">FOLLOW THE FLAVOUR</span>
            </h2>
            <p className="mt-1.5 text-sm text-on-surface-variant md:mt-2">
              <span className="md:hidden">Tag @JaiJinendraNamkeens</span>
              <span className="hidden md:inline">
                Tag @JaiJinendraNamkeens on your teatime snaps and family gatherings.
              </span>
            </p>
          </div>
          <Link
            href="https://instagram.com/JaiJinendraNamkeens"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-sm font-semibold text-primary underline-offset-4 hover:underline"
          >
            <span className="md:hidden">Instagram</span>
            <span className="hidden md:inline">Follow on Instagram</span>{" "}
            <ExternalLink className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-2 md:hidden">
          {mobilePosts.map((post) => (
            <Link
              key={post.id}
              href={post.href}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative aspect-square overflow-hidden rounded-lg bg-surface-container"
            >
              <Image
                src={post.image}
                alt={post.imageAlt}
                fill
                sizes="50vw"
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />
            </Link>
          ))}
        </div>

        <div className="hidden grid-cols-2 gap-3 md:grid md:grid-cols-3 md:gap-4 lg:grid-cols-6">
          {posts.map((post) => (
            <Link
              key={post.id}
              href={post.href}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative aspect-square overflow-hidden rounded-lg bg-surface-container"
            >
              <Image
                src={post.image}
                alt={post.imageAlt}
                fill
                sizes="(max-width:1024px) 33vw, 16vw"
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
