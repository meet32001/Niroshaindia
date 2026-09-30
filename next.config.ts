import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  compiler: {
    removeConsole: process.env.NODE_ENV === "production" ? { exclude: ["error", "warn"] } : false,
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "vsprod.vijaysales.com",
      },
      {
        protocol: "https",
        hostname: "www.vijaysales.com",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "upload.wikimedia.org",
      },
      {
        protocol: "https",
        hostname: "**.supabase.co",
      },
      {
        protocol: "https",
        hostname: "frigidaire.bynder.com",
      },
    ],
  },
  async redirects() {
    return [
      {
        source: "/deal",
        destination: "/deals",
        permanent: true,
      },
      {
        source: "/faq",
        destination: "/contact",
        permanent: true,
      },
      {
        source: "/about",
        destination: "/",
        permanent: true,
      },
      {
        source: "/warranty",
        destination: "/terms#brand-warranty",
        permanent: true,
      },
      {
        source: "/returns",
        destination: "/terms#replacement-policy",
        permanent: true,
      },
      {
        source: "/refunds",
        destination: "/terms#replacement-policy",
        permanent: true,
      },
    ];
  },
  async headers() {
    const isProd = process.env.NODE_ENV === "production";

    const cspHeader = `
      default-src 'self';
      script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.clerk.accounts.dev https://clerk.niroshaindia.com https://challenges.cloudflare.com;
      style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
      img-src 'self' blob: data: https://vsprod.vijaysales.com https://www.vijaysales.com https://images.unsplash.com https://upload.wikimedia.org https://*.supabase.co https://frigidaire.bynder.com https://img.clerk.com;
      font-src 'self' https://fonts.gstatic.com data:;
      connect-src 'self' https://*.supabase.co wss://*.supabase.co https://*.clerk.accounts.dev https://clerk.niroshaindia.com https://challenges.cloudflare.com https://api.postalpincode.in;
      frame-src 'self' https://challenges.cloudflare.com;
      worker-src 'self' blob:;
      object-src 'none';
      base-uri 'self';
      form-action 'self';
      frame-ancestors 'none';
      ${isProd ? "upgrade-insecure-requests;" : ""}
    `
      .replace(/\s{2,}/g, " ")
      .trim();

    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-DNS-Prefetch-Control", value: "on" },
          {
            key: "Strict-Transport-Security",
            value: isProd
              ? "max-age=63072000; includeSubDomains; preload"
              : "max-age=0",
          },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), browsing-topics=()" },
          { key: "Content-Security-Policy", value: cspHeader },
        ],
      },
    ];
  },
};

export default nextConfig;
