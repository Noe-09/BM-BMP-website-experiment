import { pageMetadata } from "@/lib/seo";
import type { Metadata } from "next";

import { PageHero } from "@/components/site/PageHero";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import { Container } from "@/components/ui/Container";
import { ABOUT } from "@/content/about";

export const metadata: Metadata = pageMetadata("/about", "About Us", ABOUT.intro.value);

export default function AboutPage() {
  return (
    <div className="bmp-page bmp-page--about">
      <SiteHeader />
      <main>
        <PageHero
          eyebrow="About Us"
          headline={ABOUT.headline.value}
          intro={ABOUT.intro.value}
        />
        <section className="bmp-about-story" aria-label="About BMP">
          <Container>
            {ABOUT.paragraphs.value.map((paragraph, index) => (
              <p key={paragraph} data-paragraph={String(index + 1).padStart(2, "0")}>
                {paragraph}
              </p>
            ))}
          </Container>
        </section>
        <blockquote className="bmp-about-highlight">
          <Container>{ABOUT.highlight.value}</Container>
        </blockquote>
        <section className="bmp-about-process" aria-label="BMP process">
          <Container>
            <ol>
              {ABOUT.process.value.map((step, index) => (
                <li key={step.title}>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <h2>{step.title}</h2>
                  <p>{step.body}</p>
                </li>
              ))}
            </ol>
          </Container>
        </section>
        <aside className="bmp-about-team">
          <Container>
            <p>{ABOUT.team.value}</p>
          </Container>
        </aside>
      </main>
      <SiteFooter />
    </div>
  );
}
