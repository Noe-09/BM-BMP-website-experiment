import type { MetadataRoute } from "next";
import { getSitemapEntries, publicOrigin } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  // Valid empty urlset until an absolute, confirmed public origin is configured.
  return getSitemapEntries(publicOrigin);
}
