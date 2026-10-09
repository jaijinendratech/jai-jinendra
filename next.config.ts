import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production";

const securityHeaders = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=(self)",
  },
  {
    key: "Content-Security-Policy-Report-Only",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://checkout.razorpay.com",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https://*.supabase.co https://lh3.googleusercontent.com",
      "media-src 'self' blob: https://*.supabase.co",
      "font-src 'self' data:",
      "connect-src 'self' https://*.supabase.co https://api.razorpay.com https://lumberjack.razorpay.com",
      "frame-src https://api.razorpay.com https://checkout.razorpay.com",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join("; "),
  },
];

if (isProd) {
  securityHeaders.push({
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  });
}

const nextConfig: NextConfig = {
  // Playwright and some tools use 127.0.0.1 while `next dev` binds as localhost.
  allowedDevOrigins: ["127.0.0.1", "localhost"],
  // The invoice route reads the logo from disk; make sure it ships with the function.
  outputFileTracingIncludes: {
    "/api/orders/[id]/invoice": ["./public/brand/logo-namkeens.png"],
  },
  experimental: {
    optimizePackageImports: ["lucide-react", "@heroui/react", "react-icons"],
    // Proxy buffers request bodies; default 10MB would truncate 10MB image
    // uploads (+ multipart overhead) to /api/admin/upload.
    proxyClientMaxBodySize: "11mb",
  },
  images: {
    formats: ["image/avif", "image/webp"],
    // Product/hero images are immutable per upload URL; cache optimised variants for 30 days.
    minimumCacheTTL: 60 * 60 * 24 * 30,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
  async headers() {
    // Static public assets have stable filenames, so cache for a day and
    // revalidate in the background (default for /public is max-age=0).
    const staticAssetCache = [
      {
        key: "Cache-Control",
        value: "public, max-age=86400, stale-while-revalidate=604800",
      },
    ];
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
      { source: "/images/:path*", headers: staticAssetCache },
      { source: "/brand/:path*", headers: staticAssetCache },
    ];
  },
};

export default nextConfig;
