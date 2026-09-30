import { pageMetadata } from "@/lib/seo";
import type { Metadata } from "next";

import { TechExperience } from "@/components/tech/TechExperience";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import { TECH } from "@/content/tech";

export const metadata: Metadata = pageMetadata("/bm-tech", "BM Tech", TECH.supportingCopy);

export default function BMTechPage() {
  return (
    <div className="tech-page">
      <SiteHeader />
      <main>
        <TechExperience />
      </main>
      <SiteFooter />
    </div>
  );
}
