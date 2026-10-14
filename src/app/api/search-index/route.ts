import { getCachedProductSearchIndex } from "@/lib/catalog/cached";

export const revalidate = 60;

export async function GET() {
  return Response.json(await getCachedProductSearchIndex());
}
