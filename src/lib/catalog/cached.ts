import { unstable_cache } from "next/cache";
import { getProductSearchIndex } from "@/lib/catalog/queries";

export type SearchProductHit = {
  id: string;
  name: string;
  slug: string;
  price: number;
  description: string;
};

async function loadSearchIndex(): Promise<SearchProductHit[]> {
  const rows = await getProductSearchIndex();
  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    slug: r.slug,
    price: "price" in r && typeof r.price === "number" ? r.price : 0,
    description:
      "description" in r && typeof r.description === "string"
        ? r.description
        : "",
  }));
}

/** Cached lightweight product index for header search (tag: products). */
export const getCachedProductSearchIndex = unstable_cache(
  loadSearchIndex,
  ["product-search-index"],
  { revalidate: 60, tags: ["products"] },
);
