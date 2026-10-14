import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { OfferPopupLazy } from "@/components/layout/OfferPopupLazy";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import {
  getSpecialAttentionCategories,
  getStorefrontNavLinks,
} from "@/lib/catalog/queries";

/**
 * Public storefront frame (offer popup, announcement bar, header, footer).
 * Must not read request data (cookies/headers) so storefront pages stay
 * statically renderable and CDN-cacheable.
 */
export async function StorefrontChrome({
  children,
}: {
  children: React.ReactNode;
}) {
  const [specialAttention, categoryLinks] = await Promise.all([
    getSpecialAttentionCategories(),
    getStorefrontNavLinks(),
  ]);

  return (
    <>
      <OfferPopupLazy />
      <AnnouncementBar />
      <SiteHeader
        specialAttention={specialAttention}
        categoryLinks={categoryLinks}
      />
      <div className="flex-1">{children}</div>
      <SiteFooter categoryLinks={categoryLinks} />
    </>
  );
}
