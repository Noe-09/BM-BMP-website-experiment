import type { Metadata, MetadataRoute } from "next";
import { projectRegistry } from "./projects/selected-work.ts";
import { CREATOR } from "../content/creator.ts";
import { getPublishedCreatorWorlds } from "./creator/publication.ts";

// Set only after the public production origin is confirmed. Never infer it from a request host.
export function confirmedOrigin(value: string | undefined): string | null {
  if (!value) return null;
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" || url.username || url.password || url.pathname !== "/" || url.search || url.hash || url.hostname === "localhost") return null;
    return url.origin;
  } catch { return null; }
}
export const publicOrigin = confirmedOrigin(process.env.BMP_CONFIRMED_ORIGIN);
export const allowIndexing = Boolean(publicOrigin && process.env.BMP_ALLOW_INDEXING === "true");

export function pageMetadata(path: string, title: string, description: string, absolute = false, image?: string): Metadata {
  const url = publicOrigin ? `${publicOrigin}${path === "/" ? "" : path}` : undefined;
  return {
    title: absolute ? { absolute: title } : title,
    description,
    ...(publicOrigin ? { metadataBase: new URL(publicOrigin) } : {}),
    ...(url ? { alternates: { canonical: url } } : {}),
    openGraph: {
      title: absolute ? title : `${title} — BMP`,
      description,
      type: "website",
      ...(url ? { url } : {}),
      ...(publicOrigin && image ? { images: [{ url: `${publicOrigin}${image}`, alt: title }] } : {}),
    },
  };
}

export function getSitemapEntries(origin: string | null): MetadataRoute.Sitemap {
  if (!origin) return [];
  const paths = ["", "/work", "/bm-visual", "/creator", "/bm-tech", "/about", "/contact", "/studio",
    ...projectRegistry.filter(p => p.publication.status === "verified").map(p => `/work/${p.slug}`),
    ...getPublishedCreatorWorlds(CREATOR.worlds).map(world => `/creator/${world.slug}`),
  ];
  return paths.map(path => ({ url: `${origin}${path}` }));
}
