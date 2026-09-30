import type { Metadata } from "next";

import { GatewayPrototype } from "@/components/gateway/GatewayPrototype";
import { BRAND } from "@/content/brand";
import "../gateway.css";

export const metadata: Metadata = {
  title: {
    absolute: "BMP Art — Explore the Original World",
  },
  description: BRAND.positioning.value,
};

export default function Art() {
  return <GatewayPrototype />;
}
