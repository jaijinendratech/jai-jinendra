import { StorefrontChrome } from "@/components/layout/StorefrontChrome";

export default function StorefrontLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <StorefrontChrome>{children}</StorefrontChrome>;
}
