import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import {
  ABOUT,
  BRAND,
  CONTACT,
  CREATOR,
  HOME,
  NAVIGATION,
  PROJECT_STATUSES,
  SERVICES,
  WORK,
  getPublishedWorkProjects,
} from "../content/index.ts";

test("locked canonical content remains exact at the public boundary", () => {
  assert.equal(BRAND.shortPositioning.value, "Creative × Technology × Products.");
  assert.equal(
    HOME.hero.headline.value,
    "We turn ideas and business problems into brands, systems, and digital products.",
  );
  assert.deepEqual(
    HOME.hero.actions.map((action) => action.label.value),
    ["Explore our work", "Start a project"],
  );
  assert.deepEqual(
    HOME.capabilities.map((capability) => capability.name.value),
    ["BM Visual", "BM Tech", "BMP Creator"],
  );
  assert.equal(SERVICES.visual.groups.value.length, 6);
  assert.equal(SERVICES.tech.groups.value.length, 6);
  assert.ok(ABOUT.team.value.startsWith("BMP is a lean studio"));
  assert.equal(CREATOR.products.length, 6);
  assert.deepEqual(
    CREATOR.products.map(({ revealState }) => revealState),
    ["open", "open", "preview", "sealed", "sealed", "sealed"],
  );
  assert.equal(CONTACT.submission.status, "MISSING_CONTENT");
  assert.deepEqual(WORK.categories.value, [
    "Brand & Visual",
    "Web & Digital Experience",
    "Systems & Automation",
    "Products by BMP",
    "Experiments",
  ]);
});

test("every canonical destination and published status stays explicit", () => {
  assert.deepEqual(
    NAVIGATION.items.map((item) => item.href.value),
    ["/work", "/bm-visual", "/bm-tech", "/creator", "/about", "/art", "/contact"],
  );

  const projects = getPublishedWorkProjects(WORK.projects);
  assert.equal(projects.length, 4);
  for (const project of projects) {
    assert.ok(PROJECT_STATUSES.includes(project.status.value));
    assert.notEqual(project.status.value, "Client Work");
    assert.notEqual(project.status.value, "Owned Product");
  }
});

test("public route sources contain no internal prompt, legacy status, or placeholder domain", async () => {
  const files = [
    "app/layout.tsx",
    "app/page.tsx",
    "app/work/page.tsx",
    "app/work/[slug]/page.tsx",
    "app/bm-visual/page.tsx",
    "app/bm-tech/page.tsx",
    "app/creator/page.tsx",
    "app/about/page.tsx",
    "app/contact/page.tsx",
    "components/site/SiteHeader.tsx",
    "components/site/SiteFooter.tsx",
    "components/home/BmpHero.tsx",
    "components/home/CapabilityWorlds.tsx",
    "components/work/WorkProjectIndex.tsx",
    "components/case/ProjectCasePage.tsx",
    "components/case/CanonicalCaseSummary.tsx",
    "content/brand.ts",
    "content/home.ts",
    "content/about.ts",
    "content/services.ts",
    "content/creator.ts",
    "content/contact.ts",
    "content/work.ts",
  ];
  const sources = (
    await Promise.all(
      files.map((file) =>
        readFile(new URL(`../${file}`, import.meta.url), "utf8"),
      ),
    )
  ).join("\n");

  for (const forbidden of [
    /You are BMP Content Studio/i,
    /Funnel stage/i,
    /Nano Banana image prompts/i,
    /Concept Project/,
    /Experimental Concept/,
    /BM VISUALS/,
    /\.example\.com/,
  ]) {
    assert.doesNotMatch(sources, forbidden);
  }
  assert.doesNotMatch(sources, /\b\d+(?:\.\d+)?%\b/);
});
