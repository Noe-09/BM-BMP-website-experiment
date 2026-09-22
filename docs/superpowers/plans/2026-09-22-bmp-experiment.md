# BMP Website Experiment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Status:** APPROVED FOR ISOLATED EXPERIMENT EXECUTION by owner on 2026-09-22. This plan was written as a local review document; approval authorizes only a separate repository and isolated Preview workflow. No modification to the original V1 repository, its domains or production deployment is authorized. Creating a Vercel project through an import that automatically publishes a production deployment is NOT authorized; stop and use an explicit Preview-only route instead.

**Goal:** Reproduce the specified BMP V1 commit in a distinct experiment repository and Vercel project, show a business-first Adaptive Editorial landing page at `/`, preserve the original immersive Gateway at `/art`, and produce comparable SEO, performance, mobile and usability evidence without changing V1.

**Architecture:** Clone the full Next.js application from the exact upstream commit to an independent GitHub repository with a separate remote and separate Vercel project. Move the Gateway route composition, not its underlying experience engine, to `/art`; replace `/` with a server-rendered landing page and scoped CSS using verified BMP content. Make inquiry and indexing behavior safe by default on the experiment, and use a protected Preview only.

**Tech Stack:** Existing repo versions: Next.js 16.3.1, React 19.2.8, TypeScript 5, Three.js ^0.185.1; node:test `.mjs` test suite; Vercel Preview. Do not add a CMS, animation package, database, new service routes or unnecessary dependencies.

**Spec:** `BMP_EXPERIMENT_DESIGN_SPEC_REVIEW.md` in the accompanying review packet; approved by owner in chat on 2026-09-22. When execution is separately approved, put both the approved spec and this plan in the **experiment** repo under `docs/superpowers/specs/2026-09-22-bmp-experiment-design.md` and `docs/superpowers/plans/2026-09-22-bmp-experiment.md`. Never write these files into the V1 repo.

## Global Constraints

- Source repository is `Noe-09/BM-BMP-website`; exact source SHA is `fd66811f7fb96c0a733ec8b1915d305af6db50ae`, not whatever `main` points to when execution begins.
- Target names, subject to availability: `Noe-09/BM-BMP-website-experiment` and Vercel project `bmp-website-experiment`. If unavailable, stop for owner approval of replacements.
- Original repository, original Vercel project, original domains and original production deployment are strictly read-only. Do not open V1 PRs, merge or push to V1.
- Experiment `/` = business-first landing; `/art` = original Gateway; `/studio` is retained, with no redirect in this MVP.
- No production domain switch, production promotion, third-party business redesign, client outreach, invented evidence, unverified social links or unapproved contact delivery.
- No `.env*`, `.vercel`, credentials or production webhook values copied. New Vercel project must be positively identified by project ID before deploying.
- Preview must be protected when available, with experiment-wide `noindex` as defense in depth; omit production canonical URL until domain ownership and launch are approved.
- Use the existing verified project records/statuses and canonical brand content; adapt the approved landing prototype as **visual reference**, not as raw injected HTML.
- Tests precede behavioral production-code edits: RED -> GREEN -> refactor -> test again. Commit after each independently verified task in the experiment only.
- A commit to the experiment and Preview deployment are not permission to update V1 or promote to production.

## Review Focus (high-risk conditions and owning tests)

1. **Wrong remote or project target:** Task 1 preflight asserts V1 remote differs from experiment remote and refuses actions when target project ID is missing/equal to V1 ID.
2. **Refresh/re-entry on `/art`:** Task 2 server-route and browser checks cover direct visit, reload, back/forward, first/return visit, skip, touch preview and reduced motion.
3. **Preview inquiry unexpectedly delivers:** Task 5 tests experiment server action returns a truthful disabled state and never calls the production delivery module, even when an inherited environment variable exists.
4. **Production domain leaked into preview SEO:** Task 6 verifies preview `X-Robots-Tag`, robots response, sitemap policy and absence of production canonicals on all important routes.
5. **3D payload on landing and broken links:** Task 4 inspects the built homepage resource waterfall for Three.js/Gateway imports and Task 7 probes all internal routes and unlabeled cross-site links.

---

## Dependency graph / reviewer gates

`Task 1 (isolated base) → Task 2 (route ownership) → Task 3 (navigation) → Task 4 (landing) → Task 5 (inquiry) → Task 6 (SEO) → Task 7 (preview QA).`

Reviewer checkpoints: **G1** isolation and target IDs, **G2** `/art` route/navigation regression, **G3** landing/content/form truth, **G4** protected Preview plus comparative evidence. A task must not start until the previous gate is accepted. If anything needs additional external access or action unavailable in the connected tools, stop and ask the owner; do not substitute deployment into an existing project.

## File responsibility map (experiment repository only)

| Existing/new path | Proposed ownership |
|---|---|
| `app/page.tsx` | NEW homepage Server Component: metadata and landing composition; no `GatewayPrototype` import |
| `app/art/page.tsx` (new) | Original Gateway server route, own metadata and direct gateway CSS import |
| `components/gateway/*`, `lib/gateway/*` | Preserve experience; change only proven path assumptions, not choreography |
| `app/gateway-prototype/page.tsx` | Existing legacy redirect: examine original target and adjust to `/art` only in experiment |
| `app/gateway-prototype/technical/page.tsx` | Retain existing demo route, regression check; do not silently delete |
| `content/navigation.ts` | Central site links: `studio`→`/`, `gateway`→`/art`, preserve real division links |
| `components/site/SiteHeader.tsx`, `CompactNavigation.tsx`, `SiteFooter.tsx`, `BMVisualFooter.tsx` | Change only if central navigation data does not cover required behavior |
| `components/experiment/LandingPage.tsx` (new) | Semantic landing markup and verified content rendering, no client boundary |
| `app/experiment.css` (new) | Scoped Adaptive Editorial CSS + mobile/reduced-motion/focus behavior |
| `content/brand.ts`, `content/work.ts`, `lib/projects/selected-work.ts` | Read-only content authority; only change if an evidenced defect demands a separate approval |
| `components/contact/ContactForm.tsx`, `app/contact/actions.ts` | Experiment-only fail-closed disabled inquiry with visible copy and server guard |
| `app/robots.ts`, `app/sitemap.ts`, `next.config.ts` | Experiment-only index defenses; canonical explicitly deferred |
| `tests/experiment-*.test.mjs` (new), existing affected `tests/*.test.mjs` | Red/green contracts, route behavior, content truth, indexing and contact safety |
| `docs/experiment/{PROVENANCE,QA_REPORT}.md` (new) | Source/target IDs, screenshots, network/lab data, unresolved problems; no secrets |

Note: `app/page.tsx`, `app/studio/page.tsx`, `content/navigation.ts`, `components/site/SiteHeader.tsx`, `components/gateway/GatewayFallback.tsx`, `app/contact/actions.ts`, `components/contact/ContactForm.tsx`, `tests/gateway-navigation.test.mjs`, `tests/gateway-markup.test.mjs` and `tests/bmp-home.test.mjs` were inspected at the approved SHA. Additional hard-coded paths must be enumerated by an execution-time repository search before edits. Any path not verified should not be guessed.

### Task 1: Establish isolated source, provenance and deployment target (G1)

**Files:** Create `docs/experiment/PROVENANCE.md` in **new experiment repository**; no changes to V1. Record source SHA, original remote and main SHA, original Vercel project/deployment IDs/domain, new remote and project ID, asset/license audit and safe config. The `README.md` in original source may be empty; do not assume it describes deployment.

**Interface produced:** An immutable written record of `sourceSha`, `originalRepo`, `originalProjectId`, `experimentRepo`, `experimentProjectId`, `deploymentPolicy` consumed by every later task and by QA. These are audit fields, not app runtime settings.

- [ ] **Step 1 — Read-only baseline and local copy**
- [ ] **Step 2 — Fail-fast assertions (test first)**
- [ ] **Step 3 — RED**
- [ ] **Step 4 — Configure independent remote, without pushing**
- [ ] **Step 5 — Implement assertion and GREEN**
- [ ] **Step 6 — Protect staging and record identifiers**
- [ ] **Step 7 — Commit and push to experiment only**

**Acceptance:** original repository commit and original Vercel production deployment remain unchanged; independent Git remote and project IDs documented; no secret leakage; isolation test passes. G1 reviewer confirms.

### Task 2: Move Gateway route composition to `/art` (G2a)

- [ ] **Step 1 — First write RED route tests**
- [ ] **Step 2 — RED**
- [ ] **Step 3 — Implement route extraction**
- [ ] **Step 4 — Update existing test assertions (not delete)**
- [ ] **Step 5 — GREEN and regression**
- [ ] **Step 6 — Browser evidence**
- [ ] **Step 7 — Commit and review**

### Task 3: Remap global navigation without loops (G2b)

- [ ] **Step 1 — RED**
- [ ] **Step 2 — Run RED**
- [ ] **Step 3 — Implement**
- [ ] **Step 4 — GREEN**
- [ ] **Step 5 — Browser tests**

### Task 4: Implement compact Adaptive Editorial landing (G3a)

- [ ] **Step 1 — RED integration test**
- [ ] **Step 2 — RED**
- [ ] **Step 3 — Implement smallest page**
- [ ] **Step 4 — CSS**
- [ ] **Step 5 — GREEN**
- [ ] **Step 6 — Screenshot and review**

### Task 5: Make experiment inquiry truthful and fail closed (G3b)

- [ ] **Step 1 — RED policy test**
- [ ] **Step 2 — RED**
- [ ] **Step 3 — Implement**
- [ ] **Step 4 — GREEN and browser verification**

### Task 6: Lock experiment indexing, technical SEO, and measurable performance (G3c)

- [ ] **Step 1 — RED tests**
- [ ] **Step 2 — RED**
- [ ] **Step 3 — Implement fail-closed rules**
- [ ] **Step 4 — GREEN**
- [ ] **Step 5 — Performance proof**

### Task 7: Protected Vercel Preview, regression and comparison (G4)

- [ ] **Step 1 — Before deploying**
- [ ] **Step 2 — Local regression**
- [ ] **Step 3 — Preview deployment**
- [ ] **Step 4 — HTTP and interactions**
- [ ] **Step 5 — Visual and field/lab evidence**
- [ ] **Step 6 — Last isolation proof**
- [ ] **Step 7 — Final handoff**

## Acceptance checklist and stop conditions

- [ ] G1 — source origin exact, new repository and target project distinct, no leaked environment values, original read-only.
- [ ] G2 — `/art` direct load and interactions pass; homepage and global navigation route to intended destinations; `/studio` retained.
- [ ] G3 — approved landing renders meaningful HTML, honest project labels and contact state; no Gateway/Three.js on homepage; Preview noindex protection verified.
- [ ] G4 — tests, build and real-browser evidence recorded, Preview URL verified, original repo/deployment state checked and no production promotion.

**Stop on:** source mismatch; unavailable/ambiguous repo or project target; suspicious tracked secret; unverified asset rights or customer claim; broken Gateway navigation; inquiry delivery risks; preview indexing not controlled; failing tests/build; any operation requiring V1 write permission. Resolve and request owner review instead of bypassing a gate.

## Review decisions carried forward from approved spec

- Retain `/studio` for MVP; no redirect until duplication/SEO is audited.
- Disable Preview contact submissions without a separately approved sandbox; never copy production webhook.
- Label any external link to existing V1 demos.
- No V1 code, PR, merge, production deployment or domain changes.

## Execution approach (choose only after reviewing this plan)

**Recommended:** subagent-driven development with an independent review at G1–G4, because multiple path assumptions and the deployment target present a real chance of damaging the existing site if implemented without gates. If no subagents are available, native sequential execution with checklists, isolated local worktree, explicit target confirmations and a final independent review is acceptable. The owner approved this plan and authorized execution on 2026-09-22; use sequential execution with strict gates if independent subagents are unavailable. The restriction on original V1 and production remains unconditional.

---

_Note: this copy trims the inline code listings from the review draft for readability in the experiment repo; the authoritative step-by-step instructions (exact test code, exact commands, exact interfaces) are in the review packet the owner approved on 2026-09-22 and were followed verbatim during execution._
