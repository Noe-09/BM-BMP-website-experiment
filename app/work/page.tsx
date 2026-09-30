import { pageMetadata } from "@/lib/seo";
import type { Metadata } from "next";

import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import { PageHero } from "@/components/site/PageHero";
import { WorkProjectIndex } from "@/components/work/WorkProjectIndex";
import { WORK } from "@/content/work";

export const metadata: Metadata = pageMetadata("/work", "Work", WORK.intro.value);

export default function WorkPage() {
  return (
    <div className="bmp-page bmp-page--work">
      <SiteHeader />
      <main>
        <PageHero
          eyebrow="Work"
          headline={WORK.headline.value}
          intro={WORK.intro.value}
        />
        <WorkProjectIndex />
      </main>
      <SiteFooter />
    </div>
  );
}
