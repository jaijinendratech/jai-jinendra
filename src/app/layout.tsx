import type { Metadata } from "next";
import { Suspense } from "react";
import { Playfair_Display, Plus_Jakarta_Sans } from "next/font/google";
import { headers } from "next/headers";
import { Analytics } from "@vercel/analytics/next";
import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { AppToastProvider } from "@/components/shared/AppToastProvider";
import { SearchParamToasts } from "@/components/shared/SearchParamToasts";
import { getCachedProductSearchIndex } from "@/lib/catalog/cached";
import { getSpecialAttentionCategories } from "@/lib/catalog/queries";
import { siteConfig } from "@/data/home";
import "./globals.css";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  display: "swap",
});

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name} | ${siteConfig.tagline}`,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  keywords: [
    "Jai Jinendra",
    "namkeen",
    "mithai",
    "Rajasthani snacks",
    "gift hampers",
    "pure vegetarian sweets",
    "online namkeen store",
  ],
  authors: [{ name: siteConfig.name }],
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: siteConfig.url,
    siteName: siteConfig.name,
    title: `${siteConfig.name} | ${siteConfig.tagline}`,
    description: siteConfig.description,
    images: [
      {
        url: siteConfig.brandLogo.src,
        width: siteConfig.brandLogo.width,
        height: siteConfig.brandLogo.height,
        alt: siteConfig.brandLogo.alt,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteConfig.name} | ${siteConfig.tagline}`,
    description: siteConfig.description,
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: siteConfig.logoMark.src,
    apple: siteConfig.logoMark.src,
  },
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const headerList = await headers();
  const pathname = headerList.get("x-jj-pathname") ?? "";
  const isAdmin = pathname.startsWith("/admin");
  const searchProducts = isAdmin ? [] : await getCachedProductSearchIndex();
  const specialAttention = isAdmin ? [] : await getSpecialAttentionCategories();

  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${playfair.variable} ${jakarta.variable} h-full scroll-smooth`}
    >
      <body className="flex min-h-full flex-col bg-background font-sans text-on-surface antialiased">
        <AppToastProvider />
        <Suspense fallback={null}>
          <SearchParamToasts />
        </Suspense>
        {isAdmin ? (
          <div className="flex-1">{children}</div>
        ) : (
          <>
            <AnnouncementBar />
            <SiteHeader
              searchProducts={searchProducts}
              specialAttention={specialAttention}
            />
            <div className="flex-1">{children}</div>
            <SiteFooter />
          </>
        )}
        <Analytics />
      </body>
    </html>
  );
}
