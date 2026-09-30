import { pageMetadata } from "@/lib/seo";
import type { Metadata } from "next";

import { CreatorExperience } from "@/components/creator/CreatorExperience";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import { CREATOR } from "@/content/creator";

export const metadata: Metadata = pageMetadata("/creator", "BMP Creator", CREATOR.supportingCopy.value);

export default function CreatorPage() {
  return (
    <div className="creator-page">
      <SiteHeader />
      <main>
        <CreatorExperience worlds={CREATOR.worlds} />
      </main>
      <SiteFooter />
    </div>
  );
}
