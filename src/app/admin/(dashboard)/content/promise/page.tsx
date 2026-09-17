import type { Metadata } from "next";
import { getContentBlock, getIntegrationStatus } from "@/lib/admin/queries";
import { savePromiseContentAction } from "@/lib/admin/actions";
import { promiseHubLinks } from "@/data/promise-pages";
import { AdminPageHeader, NoticeBanner } from "@/components/admin/ui";
import { AdminIconButton } from "@/components/admin/AdminIconButton";
import { PromiseEditor } from "./PromiseEditor";

export const metadata: Metadata = {
  title: "Admin · Promise content",
  robots: { index: false, follow: false },
};

type LinkItem = { href: string; title: string; body: string };

export default async function AdminPromiseContentPage({
  searchParams,
}: {
  searchParams: Promise<{ notice?: string }>;
}) {
  const { notice } = await searchParams;
  const { supabase } = getIntegrationStatus();
  const block = await getContentBlock("promise", "hub_links");
  const links: LinkItem[] = Array.isArray(block?.content)
    ? (block!.content as LinkItem[])
    : promiseHubLinks.map((l) => ({ href: l.href, title: l.title, body: l.body }));

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <AdminPageHeader
        title="Promise content"
        description={
          supabase
            ? "Hub summaries saved to content_blocks."
            : "Static Promise hub copy — connect Supabase to persist."
        }
      />
      <NoticeBanner notice={notice} />

      <form
        action={savePromiseContentAction}
        className="space-y-4 rounded-xl border border-outline-variant/25 bg-white p-6 shadow-sm"
      >
        <PromiseEditor initial={links} />
        <AdminIconButton
          type="submit"
          label="Save promise content"
          icon="save"
          variant="primary"
        />
      </form>
    </div>
  );
}
