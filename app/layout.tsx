import type { Metadata } from "next";
import { ContextCursor } from "@/components/motion/ContextCursor";
import { SceneThemeController } from "@/components/motion/SceneThemeController";
import "./globals.css";
import "./motion.css";
import "./site.css";
import "./bmp.css";

export const metadata: Metadata = {
  title: {
    default: "BMP — Creative × Technology × Products",
    template: "%s — BMP",
  },
  description:
    "BMP is a creative-tech studio turning business problems and ideas into brands, digital systems, and products.",
  openGraph: {
    title: "BMP — Creative × Technology × Products",
    description:
      "BMP is a creative-tech studio turning business problems and ideas into brands, digital systems, and products.",
    type: "website",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full bg-background text-foreground flex flex-col">
        <SceneThemeController />
        {children}
        <ContextCursor />
      </body>
    </html>
  );
}
