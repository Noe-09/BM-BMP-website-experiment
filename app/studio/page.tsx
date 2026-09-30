import { pageMetadata } from "@/lib/seo";
import type { Metadata } from "next";

import { BmpHero } from "@/components/home/BmpHero";
import { CapabilityWorlds } from "@/components/home/CapabilityWorlds";
import { ValueFramework } from "@/components/home/ValueFramework";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import { BRAND } from "@/content/brand";

export const metadata: Metadata = pageMetadata("/studio", "BMP Studio — Creative × Technology × Products", BRAND.positioning.value, true);

export default function StudioPage() {
  return (
    <div className="bmp-page bmp-home">
      <SiteHeader />
      <main>
        <BmpHero />
        <CapabilityWorlds />
        <ValueFramework />
      </main>
      <SiteFooter />
    </div>
  );
}
