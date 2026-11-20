import type { MetadataRoute } from "next";

const PAGES = ["", "/about", "/products", "/operations", "/performance", "/markets", "/news", "/partnership"];

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.SITE_URL || "http://localhost:3000";
  return PAGES.map((p) => ({ url: `${base}${p}`, changeFrequency: "monthly", priority: p === "" ? 1 : 0.7 }));
}
