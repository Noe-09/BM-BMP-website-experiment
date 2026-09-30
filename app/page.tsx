import type { Metadata } from "next";
import Image from "next/image";
import { projectRegistry } from "@/lib/projects/selected-work";
import "./fast-entry.css";

const description =
  "We help businesses look better, communicate clearly and build useful digital experiences.";

export const metadata: Metadata = {
  title: { absolute: "BMP — Creative × Technology × Products" },
  description,
  openGraph: {
    title: "BMP — Creative × Technology × Products",
    description,
    type: "website",
  },
};

const projects = ["fabriclism", "haven"].flatMap((slug) =>
  projectRegistry.filter((project) => project.slug === slug && project.publication.status === "verified"),
);

// Native links intentionally avoid prefetching the immersive routes.
export default function Home() {
  return (
    <div className="fast-entry">
      <a className="fe-skip" href="#main">Skip to content</a>
      <header className="fe-header">
        <a className="fe-brand" href="/" aria-label="BMP home">BMP<span aria-hidden="true">®</span></a>
        <nav aria-label="Primary navigation">
          <a href="/work">WORK</a>
          <a href="#services">SERVICES</a>
          <a href="/about">ABOUT</a>
          <a href="/art">EXPLORE ART <span aria-hidden="true">↗</span></a>
          <a href="/contact">CONTACT <span aria-hidden="true">↗</span></a>
        </nav>
      </header>
      <main id="main" tabIndex={-1}>
        <section className="fe-hero" aria-labelledby="hero-title">
          <p className="fe-label"><span className="fe-dot" aria-hidden="true" />CREATIVE × TECHNOLOGY × PRODUCTS</p>
          <h1 id="hero-title">We help businesses <em>look better,</em> communicate clearly and build useful digital experiences.</h1>
          <div className="fe-actions">
            <a className="fe-button fe-button--solid" href="/work">VIEW WORK <span aria-hidden="true">↗</span></a>
            <a className="fe-button" href="/contact">START A PROJECT <span aria-hidden="true">↗</span></a>
          </div>
          <div className="fe-hero-foot"><span>Clear thinking. Distinctive work.</span><a href="/art">EXPLORE ART <span aria-hidden="true">↗</span></a></div>
        </section>
        <section className="fe-work" aria-labelledby="work-title">
          <div className="fe-section-heading"><h2 id="work-title">Selected work<span className="fe-count"> / 02</span></h2><a href="/work">ALL WORK <span aria-hidden="true">↗</span></a></div>
          <div className="fe-projects">
            {projects.map((project) => (
              <article key={project.slug}>
                <a className="fe-project" href={`/work/${project.slug}`}>
                  <div className="fe-project-image">
                    <Image src={project.previewAssets[0].src} alt={project.previewAssets[0].alt} width={1440} height={900} sizes="(max-width: 639px) 100vw, 50vw" />
                    <span className="fe-project-arrow" aria-hidden="true">↗</span>
                  </div>
                  <div className="fe-project-heading"><h3>{project.title}</h3><span className="fe-status">{project.status}</span></div>
                  <p>{project.description}</p>
                </a>
              </article>
            ))}
          </div>
        </section>
        <section id="services" className="fe-services" aria-labelledby="services-title">
          <div className="fe-section-heading"><h2 id="services-title">What we do</h2><span className="fe-label">IDEA → IDENTITY → EXPERIENCE</span></div>
          <div className="fe-service-grid">
            <div><span className="fe-number">01</span><h3>VISUAL</h3><p>Brand identity &amp; digital presentation.</p></div>
            <div><span className="fe-number">02</span><h3>DIGITAL</h3><p>Websites &amp; interactive experiences.</p></div>
            <div><span className="fe-number">03</span><h3>SYSTEMS</h3><p>Practical digital tools &amp; workflows.</p></div>
          </div>
        </section>
        <section className="fe-art" aria-labelledby="art-title">
          <div className="fe-art-orbit" aria-hidden="true"><i /><i /><i /></div>
          <div className="fe-art-copy"><p className="fe-label">WANT TO GO DEEPER?</p><h2 id="art-title">A different<br />state of BMP.</h2><p>Explore the original BMP experience.</p><a className="fe-button" href="/art">ENTER THE WORLD <span aria-hidden="true">↗</span></a></div>
          <span className="fe-art-note" aria-hidden="true">ART / SPACE / POSSIBILITY</span>
        </section>
        <section className="fe-contact" aria-labelledby="contact-title"><p className="fe-label">HAVE SOMETHING IN MIND?</p><h2 id="contact-title">Let’s make it useful.<br /><span>And unmistakably yours.</span></h2><a className="fe-button fe-button--solid" href="/contact">START A PROJECT <span aria-hidden="true">↗</span></a></section>
      </main>
      <footer className="fe-footer"><a className="fe-brand" href="/">BMP</a><p>CREATIVE × TECHNOLOGY × PRODUCTS</p><a href="/contact">CONTACT <span aria-hidden="true">↗</span></a></footer>
    </div>
  );
}
