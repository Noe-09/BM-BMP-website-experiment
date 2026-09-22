import type { Metadata } from "next";

import { GatewayPrototype } from "@/components/gateway/GatewayPrototype";
import { BRAND } from "@/content/brand";
import "../gateway.css";

export const metadata: Metadata = {
  title: {
    absolute: "BMP — Creative × Technology × Products",
  },
  description: BRAND.positioning.value,
};

export default function ArtPage() {
  return <GatewayPrototype />;
}
