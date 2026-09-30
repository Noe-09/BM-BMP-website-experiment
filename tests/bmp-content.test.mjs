import assert from "node:assert/strict";
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

test("canonical exports keep BMP positioning and Home decision copy exact", () => {
  assert.equal(
    BRAND.positioning.value,
    "BMP is a creative-tech studio turning business problems and ideas into brands, digital systems, and products.",
  );
  assert.equal(BRAND.shortPositioning.value, "Creative × Technology × Products.");
  assert.equal(HOME.hero.eyebrow.value, "Creative × Technology × Products");
  assert.equal(
    HOME.hero.headline.value,
    "We turn ideas and business problems into brands, systems, and digital products.",
  );
  assert.equal(
    HOME.hero.supportingCopy.value,
    "BMP is a creative-tech studio working across visual identity, digital experiences, practical business systems, and products of our own.",
  );
  assert.deepEqual(
    HOME.hero.actions.map(({ label, href }) => [label.value, href.value]),
    [
      ["Explore our work", "/work"],
      ["Start a project", "/contact"],
    ],
  );
});

test("canonical capability and service collections cannot silently drift", () => {
  assert.deepEqual(
    HOME.capabilities.map(({ name, headline, href }) => [
      name.value,
      headline.value,
      href.value,
    ]),
    [
      ["BM Visual", "Make the brand worth noticing.", "/bm-visual"],
      ["BM Tech", "Build systems around real problems.", "/bm-tech"],
      ["BMP Creator", "We build our own things too.", "/creator"],
    ],
  );
  assert.deepEqual(SERVICES.visual.groups.value, [
    "Brand identity & visual direction",
    "Website visual presentation / landing page creative direction",
    "Social media visual systems & content assets",
    "Marketing creatives / campaign visuals",
    "AI-assisted visual production & concept development",
    "Logo motion, intro/outro and lightweight motion assets",
  ]);
  assert.deepEqual(SERVICES.tech.groups.value, [
    "Business websites & focused web systems",
    "Workflow automation and integrations",
    "AI-assisted internal tools and customer-facing utilities",
    "Chat / support / lead-handling systems",
    "CRM-lite and operational dashboards",
    "Custom MVPs and practical digital prototypes",
  ]);
});

test("About, Creator, Contact, navigation, and Work expose only approved public structure", () => {
  assert.deepEqual(
    ABOUT.process.value.map(({ title }) => title),
    ["Understand", "Define", "Build", "Review", "Improve"],
  );
  assert.equal(
    ABOUT.team.value,
    "BMP is a lean studio built around hands-on execution. We keep the team structure focused and bring the work back to the people actually designing, building, testing, and shipping it.",
  );
  assert.equal(CREATOR.products.length, 6);
  assert.deepEqual(
    CREATOR.products.map(({ name }) => name),
    ["WEINS", "SLYOUR", "THE XIDE", "PAWSONA", "RELATIONSHIP", "MINER"],
  );
  assert.equal(CONTACT.submission.status, "MISSING_CONTENT");
  assert.ok(
    CONTACT.fields.every(
      (field) =>
        field.label.status === "APPROVED_COPY" &&
        field.name.status === "STRUCTURED_DATA" &&
        field.kind.status === "STRUCTURED_DATA" &&
        field.required.status === "STRUCTURED_DATA",
    ),
  );
  assert.deepEqual(
    [
      [NAVIGATION.studio.label.value, NAVIGATION.studio.href.value],
      [NAVIGATION.gateway.label.value, NAVIGATION.gateway.href.value],
    ],
    [
      ["BMP", "/studio"],
      ["Switch World", "/art"],
    ],
  );
  assert.deepEqual(
    NAVIGATION.items.map(({ label, href }) => [label.value, href.value]),
    [
      ["Switch World", "/art"],
      ["Work", "/work"],
      ["BM Visual", "/bm-visual"],
      ["BM Tech", "/bm-tech"],
      ["BMP Creator", "/creator"],
      ["About Us", "/about"],
      ["Start a Project", "/contact"],
    ],
  );
  assert.deepEqual(WORK.categories.value, [
    "Brand & Visual",
    "Web & Digital Experience",
    "Systems & Automation",
    "Products by BMP",
    "Experiments",
  ]);
  assert.deepEqual(PROJECT_STATUSES, [
    "Client Work",
    "Concept",
    "Demo",
    "Experiment",
    "Owned Product",
  ]);
});

test("Work publication fails closed when status or required proof is unverified", () => {
  const approved = (value) => ({
    status: "STRUCTURED_DATA",
    value,
    source: "test:verified-fixture",
  });
  const missing = (note) => ({
    status: "MISSING_CONTENT",
    value: null,
    source: "test:missing-fixture",
    reviewNote: note,
  });
  const verifiedProject = {
    name: approved("Verified concept"),
    slug: approved("verified-concept"),
    status: approved("Concept"),
    categories: approved(["Experiments"]),
    challenge: approved("A verified challenge."),
    created: approved("A verified prototype."),
    heroAssets: approved([
      {
        src: "/projects/example/hero.webp",
        alt: "Verified prototype interface",
        kind: "image",
        status: "verified",
      },
    ]),
    outcome: approved("A supported qualitative improvement."),
    caseStudy: {
      challenge: approved("A verified challenge."),
      direction: approved("A verified direction."),
      built: approved("A verified build description."),
      significance: approved("A supported qualitative reason."),
      next: approved("A verified next step."),
    },
    publication: { status: "verified", source: "test:human-verification" },
  };
  const unverifiedStatus = {
    ...verifiedProject,
    slug: approved("unverified-status"),
    status: missing("Project status has not been verified."),
  };
  const incompleteProof = {
    ...verifiedProject,
    slug: approved("incomplete-proof"),
    outcome: missing("Outcome has not been verified."),
  };
  const draft = {
    ...verifiedProject,
    slug: approved("draft-project"),
    publication: { status: "draft", source: "test:not-approved" },
  };

  assert.deepEqual(
    getPublishedWorkProjects([
      unverifiedStatus,
      incompleteProof,
      draft,
      verifiedProject,
    ]).map(({ slug }) => slug.value),
    ["verified-concept"],
  );
});

test("the exported public content boundary excludes Content Studio production instructions", () => {
  const publicContent = JSON.stringify({
    BRAND,
    HOME,
    ABOUT,
    SERVICES,
    CREATOR,
    CONTACT,
    WORK,
    NAVIGATION,
  });

  assert.doesNotMatch(publicContent, /You are BMP Content Studio/i);
  assert.doesNotMatch(publicContent, /WHEN I GIVE YOU A TOPIC/i);
  assert.doesNotMatch(publicContent, /Nano Banana image prompts/i);
  assert.doesNotMatch(publicContent, /70% TOF/i);
});
