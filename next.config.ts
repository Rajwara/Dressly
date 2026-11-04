import type { NextConfig } from "next";

// Keep links to the old static-site URLs (e.g. product-foo.html) working.
const legacy = (source: string, destination: string) => ({ source, destination, permanent: true });

const nextConfig: NextConfig = {
  // Two root layouts (store and test mock) need a shared 404: app/global-not-found.tsx
  experimental: { globalNotFound: true },
  async redirects() {
    return [
      legacy("/index.html", "/"),
      legacy("/category-:slug([a-z0-9-]+).html", "/category/:slug"),
      legacy("/product-:slug([a-z0-9-]+).html", "/product/:slug"),
      legacy("/policy-:slug([a-z0-9-]+).html", "/policies/:slug"),
      legacy("/stores.html", "/branches"),
      legacy("/stores", "/branches"),
      legacy("/journal", "/blog"),
      legacy("/journal.html", "/blog"),
      legacy("/:page(about|account|cart|contact|search|wishlist).html", "/:page"),
    ];
  },
};

export default nextConfig;
