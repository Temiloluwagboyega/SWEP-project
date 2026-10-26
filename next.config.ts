import type { NextConfig } from "next";
const config: NextConfig = {
  poweredByHeader: false,
  webpack(config, { dev }) {
    // Optional low-disk build mode; normal development caching stays enabled.
    if (!dev && process.env.CAMPUS_DISABLE_BUILD_CACHE === "1")
      config.cache = false;
    return config;
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "same-origin" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Cache-Control", value: "private, no-store" },
        ],
      },
    ];
  },
};
export default config;
