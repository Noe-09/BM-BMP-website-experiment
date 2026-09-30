import type { Metadata } from "next";
import Link from "next/link";
import "../../gateway.css";

export const metadata: Metadata = {
  title: "BMP Technical Prototype",
  robots: { index: false, follow: false },
};

export default function TechnicalPrototypePage() {
  return (
    <main className="gateway-fallback gateway-technical">
      <div className="gateway-fallback__inner">
        <p className="gateway-fallback__division-name">BMP TECHNICAL</p>
        <p className="gateway-fallback__division-type">Technology / AI Systems</p>
        <h1>PROTOTYPE DESTINATION</h1>
        <Link href="/art" className="gateway-fallback__action">
          BACK TO GATEWAY ←
        </Link>
      </div>
    </main>
  );
}
