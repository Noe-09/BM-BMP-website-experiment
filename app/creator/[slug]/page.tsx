import { pageMetadata } from "@/lib/seo";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { CreatorDetailShell } from "@/components/creator/detail/CreatorDetailShell";
import { CREATOR } from "@/content/creator";
import {
  getPublishedCreatorWorld,
  getPublishedCreatorWorlds,
} from "@/lib/creator/publication";

export const dynamicParams = false;

export function generateStaticParams() {
  return getPublishedCreatorWorlds(CREATOR.worlds).map(({ slug }) => ({ slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/creator/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const world = getPublishedCreatorWorld(slug, CREATOR.worlds);
  if (!world) notFound();

  return pageMetadata(`/creator/${slug}`, `${world.name} — BMP Creator`, world.developmentNote, true);
}

export default async function CreatorDetailPage({
  params,
}: PageProps<"/creator/[slug]">) {
  const { slug } = await params;
  const world = getPublishedCreatorWorld(slug, CREATOR.worlds);
  if (!world) notFound();

  return <CreatorDetailShell world={world} worlds={CREATOR.worlds} />;
}
