type ColumnProbe = {
  from: (table: string) => {
    select: (columns: string) => {
      limit: (count: number) => PromiseLike<{ error: unknown }>;
    };
  };
};

let cache: { at: number; ready: boolean } | null = null;

/**
 * True once migration 010 is on this database.
 * A short cache so a just-applied migration is picked up without a process restart.
 */
export async function productDetailSchemaReady(
  client: ColumnProbe,
): Promise<boolean> {
  if (cache && Date.now() - cache.at < 20_000) return cache.ready;

  const [products, attributes] = await Promise.all([
    client.from("products").select("shipping_title").limit(1),
    client.from("attribute_definitions").select("filterable").limit(1),
  ]);
  const ready = !products.error && !attributes.error;
  cache = { at: Date.now(), ready };
  return ready;
}
