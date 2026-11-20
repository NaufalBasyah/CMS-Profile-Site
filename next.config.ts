import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Data is read at request time and cached with "use cache"; admin saves
  // refresh it with updateTag (see lib/content.ts and lib/admin/actions.ts).
  cacheComponents: true,
  partialPrefetching: true,
  // PGlite (the local fallback database) ships WebAssembly files that must not be bundled.
  serverExternalPackages: ["@electric-sql/pglite"],
  experimental: {
    // Image uploads in the admin panel are capped at 3 MB; leave room for the form fields.
    serverActions: { bodySizeLimit: "4mb" },
  },
  poweredByHeader: false,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
