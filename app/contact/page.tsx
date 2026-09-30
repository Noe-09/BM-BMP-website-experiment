import { pageMetadata } from "@/lib/seo";
import type { Metadata } from "next";

import { ContactForm } from "@/components/contact/ContactForm";
import { PageHero } from "@/components/site/PageHero";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import { Container } from "@/components/ui/Container";
import { CONTACT } from "@/content/contact";

export const metadata: Metadata = pageMetadata("/contact", "Start a Project", CONTACT.body.value);

export default function ContactPage() {
  return (
    <div className="bmp-page bmp-page--contact">
      <SiteHeader />
      <main>
        <PageHero
          eyebrow="Start a Project"
          headline={CONTACT.headline.value}
          intro={CONTACT.body.value}
        />
        <section className="bmp-contact" aria-label="Project inquiry">
          <Container>
            <ContactForm />
          </Container>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
