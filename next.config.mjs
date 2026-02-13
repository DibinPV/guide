import withPWA from "next-pwa";

const nextConfig = {
  reactStrictMode: true,
  experimental: {
    serverActions: { allowedOrigins: ["*"] }
  },
  async headers() {
    // Allow eval only in development to avoid CSP blocking map rendering.
    if (process.env.NODE_ENV === "production") return [];
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Content-Security-Policy",
            value: "script-src 'self' 'unsafe-eval' 'unsafe-inline' https: http:; object-src 'none'; base-uri 'self';"
          }
        ]
      }
    ];
  }
};

export default withPWA({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/[abc]\.tile\.openstreetmap\.org\/.*$/,
      handler: "CacheFirst",
      options: {
        cacheName: "map-tiles",
        expiration: { maxEntries: 1000, maxAgeSeconds: 60 * 60 * 24 * 30 }
      }
    }
  ]
})(nextConfig);
