import type { MetadataRoute } from "next";
import { publicOrigin } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  // Allow crawling so preview noindex directives can be read. Never block them in robots.txt.
  return { rules: { userAgent: "*", allow: "/" }, ...(publicOrigin ? { sitemap: `${publicOrigin}/sitemap.xml` } : {}) };
}
