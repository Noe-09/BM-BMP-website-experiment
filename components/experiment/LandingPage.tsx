import Image from "next/image";
import Link from "next/link";

import { Container } from "@/components/ui/Container";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import { BRAND } from "@/content/brand";
import { CONTACT } from "@/content/contact";
import { HOME } from "@/content/home";
import { getPublishedWorkProjects, WORK } from "@/content/work";
import { projectRegistry } from "@/lib/projects/selected-work";

const publishedSlugs = new Set(
  getPublishedWorkProjects(WORK.projects).map((project) => project.slug.value),
);

const SELECTED_WORK_SLUGS = ["fabriclism", "haven"] as const;

const selectedWork = SELECTED_WORK_SLUGS.map((slug) =>
  projectRegistry.find((project) => project.slug === slug),
).filter(
  (project): project is NonNullable<typeof project> =>
    project !== undefined && publishedSlugs.has(project.slug),
);

export function LandingPage() {
  return (
    <div className="bmp-page bmp-experiment">
      <SiteHeader />
      <main>
        <section className="bmp-experiment-hero" aria-labelledby="bmp-experiment-title">
          <Container className="bmp-experiment-hero__inner">
            <p className="bmp-experiment-hero__eyebrow">{HOME.hero.eyebrow.value}</p>
            <h1 id="bmp-experiment-title">{HOME.hero.headline.value}</h1>
            <p className="bmp-experiment-hero__intro">{HOME.hero.supportingCopy.value}</p>
            <div className="bmp-experiment-hero__actions">
              {HOME.hero.actions.map((action) => (
                <Link
                  key={action.href.value}
                  href={action.href.value}
                  className={
                    action.href.value === "/work"
                      ? "bmp-button bmp-button--solid"
                      : "bmp-button"
                  }
                >
                  {action.label.value}
                  <span aria-hidden="true">↗</span>
                </Link>
              ))}
            </div>
          </Container>
        </section>

        <section id="work" className="bmp-experiment-work" aria-label="Selected work">
          <Container>
            <header className="bmp-experiment-section__header">
              <h2>{WORK.headline.value}</h2>
              <p>{WORK.intro.value}</p>
            </header>

            <div className="bmp-experiment-work__grid">
              {selectedWork.map((project, index) => (
                <article key={project.slug} className="bmp-experiment-work__card">
                  <figure className="bmp-experiment-work__media">
                    <Image
                      src={project.previewAssets[0].src}
                      alt={project.previewAssets[0].alt}
                      fill
                      loading={index === 0 ? "eager" : "lazy"}
                      sizes="(max-width: 767px) 100vw, 48vw"
                    />
                  </figure>
                  <div className="bmp-experiment-work__body">
                    <p className="bmp-experiment-work__status">{project.status}</p>
                    <h3>{project.title}</h3>
                    <p>{project.challenge}</p>
                    <div className="bmp-experiment-work__actions">
                      <Link href={`/work/${project.slug}`}>See process →</Link>
                      {project.liveUrl ? (
                        <a href={project.liveUrl} target="_blank" rel="noopener noreferrer">
                          Visit live (external) ↗
                        </a>
                      ) : null}
                    </div>
                  </div>
                </article>
              ))}
            </div>

            <Link href="/work" className="bmp-experiment-work__all">
              View all work<span aria-hidden="true">↗</span>
            </Link>
          </Container>
        </section>

        <section id="services" className="bmp-experiment-services" aria-label="Services">
          <Container>
            <header className="bmp-experiment-section__header">
              <h2>What we do</h2>
              <p>{BRAND.audience.value}</p>
            </header>

            <div className="bmp-experiment-services__grid">
              {HOME.capabilities.map((capability) => (
                <article key={capability.key} className="bmp-experiment-services__card">
                  <h3>{capability.name.value}</h3>
                  <p className="bmp-experiment-services__headline">
                    {capability.headline.value}
                  </p>
                  <p>{capability.supportingCopy.value}</p>
                  <Link href={capability.href.value}>
                    Explore {capability.name.value}
                    <span aria-hidden="true">↗</span>
                  </Link>
                </article>
              ))}
            </div>
          </Container>
        </section>

        <section id="approach" className="bmp-experiment-approach" aria-label="Approach">
          <Container>
            <header className="bmp-experiment-section__header">
              <h2>How we work</h2>
              <p>{BRAND.promise.value}</p>
            </header>
            <ol className="bmp-experiment-approach__list">
              {BRAND.valueFramework.value.map((step, index) => (
                <li key={step}>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <strong>{step}</strong>
                </li>
              ))}
            </ol>
          </Container>
        </section>

        <section id="art" className="bmp-experiment-art" aria-label="Explore our world">
          <Container className="bmp-experiment-art__inner">
            <h2>There is another side to BMP.</h2>
            <p>
              An immersive, experimental gateway into the same studio — built with the same
              technology thinking we bring to client work.
            </p>
            <Link href="/art" className="bmp-button bmp-button--solid">
              Explore Our World<span aria-hidden="true">↗</span>
            </Link>
          </Container>
        </section>

        <section id="contact" className="bmp-experiment-contact" aria-label="Start a project">
          <Container className="bmp-experiment-contact__inner">
            <h2>{CONTACT.headline.value}</h2>
            <p>{CONTACT.body.value}</p>
            <div className="bmp-experiment-contact__actions">
              <Link href="/contact" className="bmp-button bmp-button--solid">
                {CONTACT.primaryAction.label.value}
                <span aria-hidden="true">↗</span>
              </Link>
              <Link href={CONTACT.secondaryAction.href.value} className="bmp-button">
                {CONTACT.secondaryAction.label.value}
                <span aria-hidden="true">↗</span>
              </Link>
            </div>
          </Container>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
