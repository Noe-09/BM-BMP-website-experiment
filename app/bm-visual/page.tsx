import { pageMetadata } from "@/lib/seo";
import type { Metadata } from "next";

import { CapabilitiesIndex } from "@/components/home/CapabilitiesIndex";
import { ClosingScene } from "@/components/home/ClosingScene";
import { HeroSequence } from "@/components/home/HeroSequence";
import { StudioProcess } from "@/components/home/StudioProcess";
import { BMVisualFooter } from "@/components/site/BMVisualFooter";
import { BMVisualHeader } from "@/components/site/BMVisualHeader";
import { SelectedWork } from "@/components/work/SelectedWork";
import { SERVICES } from "@/content/services";
import "../ending.css";
import "../home.css";

export const metadata: Metadata = pageMetadata("/bm-visual", "BM Visual", SERVICES.visual.supportingCopy.value);

export default function BMVisualPage() {
  const action = {
    label: SERVICES.visual.action.label.value,
    href: SERVICES.visual.action.href.value,
  };

  return (
    <div className="bm-visual-page">
      <BMVisualHeader />
      <main className="home-page bm-visual-flagship">
        <HeroSequence
          headline={SERVICES.visual.headline.value}
          supportingCopy={SERVICES.visual.supportingCopy.value}
          action={action}
        />
        <SelectedWork />
        <CapabilitiesIndex groups={SERVICES.visual.groups.value} />
        <StudioProcess />
        <ClosingScene action={action} />
      </main>
      <BMVisualFooter />
    </div>
  );
}
