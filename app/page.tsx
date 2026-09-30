/* eslint-disable @next/next/no-html-link-for-pages -- Native, permanent links avoid prefetch and presentation-dependent navigation. */
import type { Metadata } from "next";
import Image from "next/image";
import { GatewayLite } from "@/components/gateway/GatewayLite";
import { BRAND } from "@/content/brand";
import { projectRegistry } from "@/lib/projects/selected-work";
import { pageMetadata } from "@/lib/seo";
import "./gateway-lite.css";

export const metadata: Metadata = pageMetadata("/", "BMP — Creative × Technology × Products", BRAND.positioning.value, true);

const worlds = [
  { name: "BMP VISUAL", division: "visuals", href: "/bm-visual", description: "Brand identity & digital experiences.", detail: "Make the brand worth noticing." },
  { name: "BMP CREATOR", division: "creator", href: "/creator", description: "Original products & experiments.", detail: "Things we decided should exist." },
  { name: "BMP TECH", division: "technical", href: "/bm-tech", description: "Practical systems & digital tools.", detail: "Build systems around real problems." },
];
const projects = projectRegistry.filter(project => ["fabriclism", "haven"].includes(project.slug) && project.publication.status === "verified");

export default function Home() {
  return (
    <main className="gateway-lite">
      <section className="gl-hero" aria-labelledby="gateway-heading">
        <GatewayLite />
        <header className="gl-header">
          <a className="gl-mark" href="/" aria-label="BMP home">BMP</a>
          <nav aria-label="Primary navigation"><a href="#worlds" data-skip>SKIP TO WORLDS ↓</a><a href="/work">WORK ↗</a><a href="/contact">CONTACT ↗</a></nav>
        </header>
        <div className="gl-intro">
          <h1 id="gateway-heading">BMP — Creative × Technology × Products.</h1>
          <p>{BRAND.positioning.value}</p>
        </div>
        <div className="gl-space" aria-hidden="true" />
        <nav className="gl-worlds" id="worlds" aria-label="Choose a BMP world" tabIndex={-1}>
          <p className="gl-eyebrow">THREE WORLDS. ONE STUDIO.</p>
          <div className="gl-world-grid">
            {worlds.map((world, index) => <a href={world.href} data-world={world.division} key={world.division}>
              <span className="gl-world-index">0{index + 1}</span><span><strong>{world.name}</strong><span className="gl-world-description">{world.description}</span></span><span className="gl-arrow" aria-hidden="true">↗</span>
            </a>)}
          </div>
        </nav>
      </section>
      <div className="gl-content">
        <section aria-labelledby="selected-work-heading" className="gl-work">
          <div className="gl-section-title"><h2 id="selected-work-heading">Selected Work</h2><a href="/work">VIEW ALL WORK ↗</a></div>
          <div className="gl-project-grid">{projects.map(project => <article key={project.slug}>
            <a className="gl-project" href={`/work/${project.slug}`}>
              <Image src={project.previewAssets[0].src} alt={project.previewAssets[0].alt} width={1440} height={900} sizes="(max-width: 639px) 100vw, 50vw" />
              <div className="gl-project-title"><h3>{project.title}</h3><span>{project.status}</span><span aria-hidden="true">↗</span></div>
              <p>{project.description}</p>
            </a>
          </article>)}</div>
        </section>
        <section aria-labelledby="what-heading" className="gl-what">
          <h2 id="what-heading">What BMP Does</h2><p>{BRAND.promise.value}</p>
          <div className="gl-capabilities"><p>Brand identity &amp;<br />digital presentation.</p><p>Websites &amp;<br />interactive experiences.</p><p>Practical tools &amp;<br />business workflows.</p></div>
        </section>
        <section aria-labelledby="worlds-heading" className="gl-directory">
          <div className="gl-section-title"><h2 id="worlds-heading">Visual / Creator / Tech</h2><span className="gl-eyebrow">CHOOSE YOUR DIRECTION</span></div>
          {worlds.map(world => <a href={world.href} key={world.division}><h3>{world.name}</h3><p>{world.detail}</p><span aria-hidden="true">↗</span></a>)}
        </section>
        <section aria-labelledby="contact-heading" className="gl-contact">
          <p className="gl-eyebrow">START WITH A CONVERSATION</p><h2 id="contact-heading">Have a problem<br />worth solving?</h2><a className="gl-contact-link" href="/contact">START A PROJECT ↗</a>
        </section>
        <footer className="gl-footer"><span className="gl-mark">BMP</span><p>CREATIVE × TECHNOLOGY × PRODUCTS</p><a href="/about">ABOUT BMP ↗</a></footer>
      </div>
    </main>
  );
}
