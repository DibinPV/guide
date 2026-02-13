import withPWA from "next-pwa";

const nextConfig = {
  reactStrictMode: true,
  experimental: {
    serverActions: { allowedOrigins: ["*"] }
  }
};

export default withPWA({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/demotiles\.maplibre\.org\/.*$/,
      handler: "CacheFirst",
      options: {
        cacheName: "map-tiles",
        expiration: { maxEntries: 1000, maxAgeSeconds: 60 * 60 * 24 * 30 }
      }
    }
  ]
})(nextConfig);
