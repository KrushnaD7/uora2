import type { NextConfig } from "next";

// Backend origin that the Next.js `/api` rewrite forwards to. In development
// this is the local backend. In production, if you serve the backend at a
// different host/port, set BACKEND_URL (build-time) so the rewrite keeps
// working for same-origin /api calls; otherwise the browser hits
// NEXT_PUBLIC_API_URL directly and this rewrite is not used.
const backendUrl = process.env.BACKEND_URL || "http://localhost:5000";

// Public backend URL used by the browser in production (direct cross-origin).
// Must be in connect-src so the browser is allowed to call it.
const publicApiUrl = process.env.NEXT_PUBLIC_API_URL || "";

// Build the connect-src sources list, deduplicating 'self' and empty strings.
const connectSrcParts = ["'self'", backendUrl];
if (publicApiUrl && publicApiUrl !== backendUrl) {
  connectSrcParts.push(publicApiUrl);
}
const connectSrc = connectSrcParts.join(" ");

const nextConfig: NextConfig = {
  // Use a visible build directory -- some managed hosts (confirmed:
  // Hostinger's Node.js app file-sync step) silently omit dot-directories
  // like the default `.next` when deploying, which builds successfully but
  // leaves the running app with no frontend build output at all -- it
  // crashes immediately on nextApp.prepare(), before logging anything,
  // which is indistinguishable from the outside from every other kind of
  // silent startup failure. Renaming the output directory sidesteps the
  // whole class of bug.
  distDir: "next-build",
  turbopack: {
    root: __dirname,
  },
  poweredByHeader: false,
  compress: true,
  images: {
    // AVIF encoding (via sharp) is meaningfully more CPU/memory-hungry per
    // request than WebP for very little extra size saving -- not worth the
    // load on a shared, resource-capped host. WebP alone still optimizes
    // every image; this just drops the expensive second encode.
    formats: ["image/webp"],
    minimumCacheTTL: 60 * 60 * 24 * 30,
  },
  async headers() {
    return [
      {
        source: "/images/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/:path*",
        headers: [
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: blob:",
              "font-src 'self' data:",
              `connect-src ${connectSrc}`,
              "frame-ancestors 'none'",
              "base-uri 'self'",
              "form-action 'self'",
            ].join("; "),
          },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value:
              "camera=(), microphone=(), geolocation=(), interest-cohort=()",
          },
        ],
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${backendUrl}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
