import Image from "next/image";
import { siteConfig } from "@/data/home";

/**
 * Full-screen route loader. Inline and button spinners stay on BrandSpinner.
 */
export function BrandLoader() {
  return (
    <div className="flex flex-col items-center gap-5">
      <style>{`
        @keyframes brand-loader-spin {
          to { transform: rotate(360deg); }
        }
        @keyframes brand-loader-pulse {
          0%, 100% { opacity: 0.72; transform: scale(0.96); }
          50% { opacity: 1; transform: scale(1); }
        }
        .brand-loader-ring {
          animation: brand-loader-spin 1.15s linear infinite;
        }
        .brand-loader-mark {
          animation: brand-loader-pulse 1.8s ease-in-out infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .brand-loader-ring,
          .brand-loader-mark {
            animation: none;
          }
        }
      `}</style>
      <div className="relative grid h-28 w-28 place-items-center">
        <span
          aria-hidden
          className="brand-loader-ring absolute inset-0 rounded-full border border-primary/25 border-t-primary"
        />
        <Image
          src="/brand/logo-mark.png"
          alt=""
          width={96}
          height={96}
          priority
          className="brand-loader-mark h-24 w-24 object-contain"
        />
      </div>
      <p className="text-xs tracking-[0.16em] text-on-surface-variant [font-variant-caps:small-caps]">
        {siteConfig.name}
      </p>
      <span role="status" aria-live="polite" className="sr-only">
        Loading
      </span>
    </div>
  );
}
