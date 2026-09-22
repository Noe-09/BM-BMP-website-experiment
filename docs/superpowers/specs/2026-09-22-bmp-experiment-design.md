# BMP Website Experiment — Design Specification (Review Draft)
Date: 2026-09-22
Status: DESIGN APPROVED 2026-09-22. Implementation plan subsequently approved by owner 2026-09-22; execution authorized ONLY in isolated experiment repository/project, with no V1, production or domain changes.

## 1. Decision and objective
Create a fully isolated experiment derived from `Noe-09/BM-BMP-website` at source commit `fd66811f7fb96c0a733ec8b1915d305af6db50ae`. Replace the experiment root homepage (`/`) with a business-first, mobile-first landing page inspired by the already-approved BMP Landing MVP; preserve the immersive original experience under `/art`. Preserve V1 source, deployment, domains, and production behavior entirely. Experiment does not establish that the redesign outperforms V1: compare using evidence.

## 2. Isolation contract
- Proposed new GitHub repo: `Noe-09/BM-BMP-website-experiment` (name subject to availability), separate Vercel project `bmp-website-experiment`. Source should be reproduced from the exact approved commit, preserving history if supported and recording the upstream SHA. No changes, pull requests, merges, deployment, webhook modification, or domain changes in original V1 repository/project.
- Before cloning, verify upstream commit is accessible, check licensing and asset suitability, repo name availability, and create a read-only inventory of routes, dependencies, local/public assets, secret requirements and remote references. Do not copy `.env*`, `.vercel`, credentials or production webhooks. Reconfigure deployment project explicitly; verify target project ID before any deployment.
- New project: preview-only, no custom domain and no promotion. Prevent indexing with Vercel deployment protection when possible; noindex headers/meta as supplementary protection, with robots/site indexing configuration reviewed prior to any later launch. Verify source and deployed target by IDs, URLs and commit IDs.
- Rollback: delete or disable only the experiment if necessary; V1 untouched. Maintain immutable provenance note identifying the source SHA.

## 3. Route contract
| Route | Experiment behavior |
|---|---|
| `/` | New business-first landing page |
| `/art` | Original Gateway immersive experience, with its state, CSS, components and navigation behavior adapted for new base path |
| `/studio` | Retain original studio page initially; decide whether to redirect or de-duplicate only after link and SEO audit |
| `/work`, `/work/[slug]` | Preserve verified portfolio and labeled project status |
| `/bm-visual`, `/bm-tech`, `/creator`, `/about`, `/contact` | Preserve functionality, copy and internal navigation, except path links necessary for experiment |

Search and replace is not adequate: audit route assumptions across `app/page.tsx`, `components/gateway`, `content/navigation.ts`, site headers/footers, static asset URLs, tests, navigation helpers, browser history, skip/reverse session logic and anchor links. `/art` must be reachable directly and refresh correctly. Client navigation and 404 handling must not take user to wrong world.

## 4. Landing page content and visual
Visual Direction C — Adaptive Editorial: bright accessible editorial surfaces for commercial information; a single restrained dark BMP art section for distinctiveness. Reuse approved copy and vetted source assets where possible; don't invent clients, metrics, social URLs or capabilities. Information sequence: (a) clear hero + direct Explore Work / Start a Project, (b) selected verified projects with honest Concept/Experiment labels, (c) concise service breakdown explaining who it serves, (d) short approach only if accurate, (e) optional Explore Our World link to `/art`, (f) contact/footer. Header nav: Work, Services (in-page section initially), About, Contact, Explore Art. Text and navigation remain available without JavaScript. No obligatory loader/tunnel or heavy WebGL dependency on `/`.

Landing page prototype is design reference, **not** an automatic production-ready replacement; map approved copy and assets into Next.js components and validate external portfolio links. Avoid fake testimonials, unverified social links, fake contact success, or duplicated SEO-thin pages. Keep minimal MVP scope, avoid adding a CMS, blog, new service subroutes or global animation engine.

## 5. SEO and technical requirements
- Homepage provides meaningful server-rendered content, semantic H1–H3, internal crawlable links and unique title/description; preview must remain unindexed. Validate `robots.txt`, `sitemap.xml`, canonical policy, metadata and redirects against actual deployment environment. Absence of sitemap is a task to evaluate, not proof SEO is impossible.
- Avoid duplicate canonical claims and production domain usage on preview; document behavior for a future domain switch but do not execute it.
- Home should not statically import or initialize Gateway Three.js bundle. Verify by build/bundle inspection and network recording rather than assumption. Optimize media, layout stability, font use, loading priority, responsive image sizing, keyboard accessibility, touch targets and reduced motion.
- Contact functionality currently relies on `BMP_INQUIRY_WEBHOOK_URL` in `app/contact/actions.ts`; no production secret copying. In Preview, use an approved sandbox destination or disable real submissions with honest messaging and a verified alternative contact method. Test request validation and actual delivery before claiming form works.

## 6. Acceptance and evidence
- Isolation: original `main` SHA unchanged; original Vercel project deployment and domain unchanged; new repo/project IDs independently recorded.
- Routes: `/`, `/art`, `/studio`, portfolio, service pages and `/contact` respond as expected; direct refresh and deep links validated. Gateway navigation sends users to correct experiment paths. No unexpected external production-domain links other than deliberate, labeled destinations.
- Usability: test at 360/390/768/1440px, physical mobile when possible; no overflow, all CTA targets/touch actions work, form behavior honest, no hover-only actions. `prefers-reduced-motion` and keyboard flow checked.
- Quality: typecheck, lint, unit/regression tests and production build; browser smoke tests; Lighthouse/PSI mobile and desktop with conditions documented; report LCP, INP (field-only where available), CLS without fabricated results; compare equal task flows against original.
- Content and SEO: no invented client claims, statuses accurate, metadata/robots/sitemap verified, preview not indexed, accessibility audit findings documented.
- Delivery: provide Preview URL, commit SHA, repo/project IDs, before–after screenshots, issue list and recommendation; **no production promotion or V1 change without a separate explicit approval**.

## 7. Out of scope and decisions needed
Out of scope: redesign all division pages; production domain swap; merging back to V1; running outreach; implementing a business redesign for a third party.
Pending decisions for approval: exact new repository/project names, handling `/studio` duplication, whether Preview contact submissions should use sandbox or be disabled, whether external links to existing V1 live case demos are acceptable. Default proposals: retain `/studio` during experiment; disable submission until a sandbox is explicitly authorized; label any external demo link.
