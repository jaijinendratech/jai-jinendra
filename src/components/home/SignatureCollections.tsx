import Image from "next/image";
import Link from "next/link";
import type { SignatureCollection } from "@/types/catalog";
import { formatINR } from "@/lib/format";

function SignatureCard({ item }: { item: SignatureCollection }) {
  return (
    <article className="culinary-lift flex h-full flex-col overflow-hidden rounded-xl border border-outline-variant/30 bg-surface-container-lowest">
      <div className="relative aspect-5/4 overflow-hidden bg-surface-container-low">
        <Image
          src={item.image}
          alt={item.imageAlt}
          fill
          sizes="(max-width:768px) 75vw, 33vw"
          className="object-cover"
        />
      </div>
      <div className="flex flex-1 flex-col space-y-2 p-3.5 md:space-y-3 md:p-5">
        <span className="label-sm uppercase tracking-widest text-primary">
          {item.eyebrow}
        </span>
        <h3 className="font-display text-lg font-semibold text-on-surface md:text-xl">
          <span className="md:hidden">{item.mobileTitle ?? item.title}</span>
          <span className="hidden md:inline">{item.title}</span>
        </h3>
        <p className="text-xs text-on-surface-variant md:text-sm">
          <span className="md:hidden">{item.mobileDescription ?? item.description}</span>
          <span className="hidden md:inline">{item.description}</span>
        </p>
        <div className="mt-auto flex items-center justify-between gap-2 pt-1 md:pt-2">
          <div>
            <p className="price text-xl font-semibold text-on-surface md:text-2xl">
              {formatINR(item.price)}
            </p>
            <p className="hidden text-xs text-on-surface-variant md:block">
              Net Wt: {item.netWeight}
            </p>
          </div>
          <Link
            href={item.href}
            className="inline-flex items-center justify-center rounded-lg bg-primary-container px-3 py-2 text-xs font-semibold text-white transition hover:bg-primary md:px-4 md:text-sm"
          >
            <span className="md:hidden">Add</span>
            <span className="hidden md:inline">Add to Box</span>
          </Link>
        </div>
      </div>
    </article>
  );
}

export function SignatureCollections({
  items,
}: {
  items: SignatureCollection[];
}) {
  return (
    <section id="combos" className="bg-surface py-8 md:py-20">
      <div className="container-jj">
        <div className="mb-5 max-w-2xl md:mb-10">
          <span className="label-sm font-bold uppercase tracking-widest text-primary">
            <span className="md:hidden">Signature Sets</span>
            <span className="hidden md:inline">Curated Connoisseur Sets</span>
          </span>
          <h2 className="font-display mt-1 text-xl font-semibold text-on-surface md:text-[32px] md:leading-10">
            <span className="md:hidden">Our Signatures</span>
            <span className="hidden md:inline">THE JAI JINENDRA SIGNATURES</span>
          </h2>
          <p className="mt-1.5 text-sm text-on-surface-variant md:mt-2 md:text-base">
            <span className="md:hidden">Heritage tins & curated gift sets.</span>
            <span className="hidden md:inline">
              Bespoke regional combinations packed in collectible heritage tin
              canisters and gold-stamped cases.
            </span>
          </p>
        </div>

        {/* Mobile horizontal carousel */}
        <div className="-mx-1 flex gap-3 overflow-x-auto px-1 pb-1 md:hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {items.map((item) => (
            <div key={item.id} className="w-[78vw] max-w-72 shrink-0">
              <SignatureCard item={item} />
            </div>
          ))}
        </div>

        <div className="hidden grid-cols-1 gap-6 md:grid md:grid-cols-3">
          {items.map((item) => (
            <SignatureCard key={item.id} item={item} />
          ))}
        </div>
      </div>
    </section>
  );
}
