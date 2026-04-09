import type { NextConfig } from "next";

const securityHeaders = [
  // Prevent DNS prefetch leaking info
  { key: "X-DNS-Prefetch-Control", value: "on" },
  // Force HTTPS for 2 years
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  // Block clickjacking
  { key: "X-Frame-Options", value: "DENY" },
  // Prevent MIME-type sniffing
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Strict referrer info
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Restrict browser APIs — allow geolocation only on same origin (for future "near me" feature)
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(self), payment=()",
  },
  // CSP — allows OSM tiles, Supabase, and nothing else external
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      // Next.js needs unsafe-inline and unsafe-eval in dev
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      // Leaflet injects inline styles
      "style-src 'self' 'unsafe-inline'",
      // OSM tile images + own assets + data URIs for Leaflet icons
      "img-src 'self' data: blob: https://*.tile.openstreetmap.org https://tile.openstreetmap.org",
      // Supabase API calls + OSM tile fetches
      "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://*.tile.openstreetmap.org",
      // Fonts from Next.js static
      "font-src 'self' data:",
      // Block iframes entirely
      "frame-ancestors 'none'",
      // Limit form targets
      "form-action 'self'",
      // Upgrade HTTP to HTTPS
      "upgrade-insecure-requests",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
