import type { Metadata } from "next";
import Link from "next/link";

import { BRAND } from "@/content/brand";

export const metadata: Metadata = {
  title: {
    absolute: "BMP — Creative × Technology × Products",
  },
  description: BRAND.positioning.value,
};

export default function Home() {
  return (
    <main>
      <h1>BMP Experiment</h1>
      <Link href="/work">Work</Link>
      <Link href="/contact">Contact</Link>
      <Link href="/art">Explore Art</Link>
    </main>
  );
}
