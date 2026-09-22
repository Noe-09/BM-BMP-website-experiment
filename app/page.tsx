import type { Metadata } from "next";

import { LandingPage } from "@/components/experiment/LandingPage";
import { BRAND } from "@/content/brand";
import "./experiment.css";

export const metadata: Metadata = {
  title: {
    absolute: "BMP — Creative × Technology × Products",
  },
  description: BRAND.positioning.value,
};

export default function Home() {
  return <LandingPage />;
}
