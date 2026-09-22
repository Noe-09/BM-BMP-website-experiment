# Experiment QA Report

Recorded 2026-09-22, Task 7 (protected Preview, regression, and comparison).

## Isolation re-check (before this QA pass)

- `git ls-remote https://github.com/Noe-09/BM-BMP-website.git HEAD` → `fd66811f7fb96c0a733ec8b1915d305af6db50ae` (unchanged).
- `git ls-remote https://github.com/Noe-09/BM-BMP-website-experiment.git refs/heads/main` → `fd66811f7fb96c0a733ec8b1915d305af6db50ae` (unchanged; all work lives on `experiment/business-first-landing` only).
- No push, PR, or write of any kind was made to `Noe-09/BM-BMP-website`.

## Vercel isolation — status: BLOCKED, undeployed

This execution environment has no `vercel` CLI, no Vercel API token, and no authenticated
Vercel session. `command -v vercel` resolves to nothing, and there is no `~/.vercel`
configuration reachable from this session. Per authorization, deployment work stops here
rather than guessing at a project ID or improvising an unverifiable integration:

- No Vercel project was created.
- No deployment (Preview or otherwise) was attempted.
- The `bm-bmp-website` production project was not touched.
- No domain/DNS changes were made.

**Owner action needed to unblock Task 7's deployment step:** create (or grant this session
working credentials to create) a Vercel project for `Noe-09/BM-BMP-website-experiment`,
explicitly not auto-deploying from `main` to production, and share both that project's ID and
the original `bm-bmp-website` project ID so `scripts/verify-isolation.mjs`'s `assertIsolation`
can be run for real before any deploy.

All QA below was therefore performed against **`npm run start`** (an actual Next.js
production build, served locally), not a hosted Preview.

## Test / build verification

- `npm test` (`node --test`, full suite): **235 / 235 passing**, 0 failing.
- `npm run typecheck` (`tsc --noEmit`): clean.
- `npm run lint` (`eslint`): clean.
- `npm run build` (`next build --webpack`): succeeds; route table includes `/`, `/art`,
  `/robots.txt`, `/sitemap.xml`, and every preserved route.
- One **pre-existing, unrelated** typecheck note: `app/creator/[slug]/page.tsx` intermittently
  reports `TS2304: Cannot find name 'PageProps'` under a bare `tsc --noEmit` invocation
  (confirmed present on the pristine `fd66811f...` source, via `git stash` + direct `tsc` run,
  before any experiment change — see chat history). It does not appear during `next build`'s
  own TypeScript pass and is not touched by this branch, per the "don't expand scope to fix
  unrelated V1 debt" instruction.

## Routes tested

All of the following returned `200` (or the documented redirect) on the local production
server (`http://127.0.0.1:4589`), verified via both `fetch` and live browser navigation:

`/`, `/art`, `/studio`, `/work`, `/bm-visual`, `/bm-tech`, `/creator`, `/about`, `/contact`,
`/gateway-prototype` (redirects `307` → `/art`), `/gateway-prototype/technical`,
`/gateway-prototype/review` (dev-only, `notFound()` in production — unchanged from V1).

- Direct load of `/art` (not just client navigation into it): confirmed 200, full Gateway
  selection UI renders.
- **Refresh on `/art`**: reloaded (`F5`) while on `/art`; URL and rendered content stayed on
  `/art` — no bounce to `/` or anywhere else.
- **Gateway exit navigation**: clicked "ENTER" under BM Visual from `/art` → landed on
  `/bm-visual` with the correct flagship page and shared header/footer nav.
- **Legacy redirect**: navigated to `/gateway-prototype` → confirmed `location.href` resolved
  to `/art` (not `/`).
- **Technical demo back-link**: `/gateway-prototype/technical` → clicked "BACK TO GATEWAY ←" →
  confirmed it lands on `/art` (previously pointed at `/`).
- **404 behavior**: an unknown path renders Next's standard not-found page (unchanged from V1,
  not part of this experiment's scope).

## Viewport / interaction checks

- Desktop (~1280px pane width): `/`, `/art`, `/studio`, `/work`, `/about`, `/bm-tech`,
  `/creator`, `/contact` all visually inspected — correct hierarchy, no obviously broken
  layout, shared header/footer nav consistent across every page.
- **390×844 (mobile)**: `/` — no horizontal overflow (`scrollWidth - clientWidth === 0`); hero,
  work cards (honest "Concept" labels), services grid, approach list, dark art teaser, and
  contact CTA all stack to a single column and render correctly. A transient blank frame was
  observed mid-scroll in one screenshot; a follow-up screenshot and direct DOM `getBoundingClientRect()`
  measurement showed this was a one-off image-load/CLS timing artifact of the screenshot tool,
  not a real layout defect — final geometry has no gap between cards.
- Mobile compact nav (`<details class="compact-nav">`, shared, pre-existing component): opens
  and closes correctly, lists all 7 items (Work, BM Visual, BM Tech, BMP Creator, About Us,
  Explore Art, Start a Project) in the same order as desktop nav.
- **360×800**: `/` and `/art` both confirmed `scrollWidth - clientWidth === 0` (no overflow).
- **Contact disabled state**: `/contact` shows the "Preview: form submissions are unavailable"
  notice; the submit button's `disabled` DOM property is `true` and its label reads
  "Preview: submissions unavailable"; verified with a dummy `BMP_INQUIRY_WEBHOOK_URL` injected
  into the server environment — the disabled state and copy do not change, and
  `resolveInquirySubmission`'s unit tests independently prove `deliver` is never invoked.
- **Reduced motion**: the experiment's own `app/experiment.css` includes a
  `@media (prefers-reduced-motion: reduce)` rule (verified present in source and covered by
  existing Gateway reduced-motion CSS tests for `/art`); this session's browser tooling does
  not expose a way to toggle `prefers-reduced-motion` at the OS/CDP level, so the rule's
  presence was verified by source inspection and the pre-existing automated test suite rather
  than a live visual toggle. Documented as a testing-tool limitation, not a claim of full
  manual verification.
- Keyboard/touch-specific Gateway interactions (first-tap preview, coarse-pointer affordances,
  skip) are exercised by the pre-existing, still-passing `gateway-navigation.test.mjs` and
  `gateway-markup.test.mjs` suites; not re-verified by hand beyond the exit-navigation click
  test above, since the Gateway experience itself is frozen and unmodified by this branch.

## Console / runtime findings

- No console errors on any route except the single, expected `404` log generated by this
  session's own deliberate navigation to a nonexistent path (`/this-route-does-not-exist`) —
  confirmed via `read_network_requests` that this is that exact request, not a stray failure.
- Benign warnings only: repeated "preloaded using link preload but not used" CSS warnings from
  Next's per-route CSS chunk preloading during client-side navigation between pages in one
  browser session. Cosmetic, present on stock Next.js apps with per-route CSS, not introduced
  by this branch, and does not affect a normal single-page-load visit.

## Indexing protection evidence

- `curl -I http://127.0.0.1:4589/` and `/art` on the production server: both return
  `X-Robots-Tag: noindex, nofollow`.
- `curl http://127.0.0.1:4589/robots.txt` → `User-Agent: *` / `Disallow: /`.
- `curl http://127.0.0.1:4589/sitemap.xml` → valid, empty `<urlset>`.
- `tests/experiment-seo.test.mjs` asserts all three, plus the meta `robots` tag and the
  absence of any `vercel.app`/`bm-bmp-website` canonical claim, on `/`, `/art`, `/studio`,
  `/work`, `/contact`.

## Bundle / performance evidence

- Production build chunk for `/`: `app/page-190d47936fe29b06.js`, **291 bytes**, zero
  occurrences of `GatewayPrototype`/`TunnelCanvas`/Three.js references.
- Production build chunk for `/art`: `app/art/page-4e795cb1ba7b6596.js`, **~21.9 KB**,
  contains the Gateway references as expected.
- This confirms the design requirement that the business-first landing carries no
  Gateway/Three.js payload, while the Gateway experience itself is untouched and isolated to
  `/art`.

### Lighthouse — actually run, against the local production server

Run with `npx lighthouse` (fetched v13.5.0 on demand), Chrome headless, against
`http://127.0.0.1:4589`, simulated throttling (Lighthouse's default lab methodology, not real
field data). Desktop uses Lighthouse's `--preset=desktop`; "mobile" is Lighthouse's own default
mobile emulation (no `--preset` flag, since `mobile` is not a valid preset value in this
Lighthouse version).

| Route | Form factor | Perf | Access. | Best Practices | SEO | LCP | CLS | TBT |
|---|---|---|---|---|---|---|---|---|
| `/` | desktop | 0.99 | 1.00 | 1.00 | 0.66 | 0.9s | 0 | 0ms |
| `/` | mobile | 0.98 | 1.00 | 1.00 | 0.66 | 2.5s | 0 | 0ms |
| `/art` | desktop | 1.00 | 0.97 | 1.00 | 0.63 | 0.5s | 0.006 | 20ms |
| `/art` | mobile | 0.98 | 0.98 | 1.00 | 0.63 | 2.3s | 0.014 | 10ms |

Notes on the two non-1.00 scores, both individually inspected in the raw Lighthouse audit output:

- **SEO score (0.63–0.66) is driven entirely by one audit: "Page is blocked from indexing."**
  This is Task 6's intended, correct behavior for a preview experiment, not a defect. No other
  SEO audit failed on either route.
- **`/art` accessibility (0.97/0.98) is driven entirely by "Document does not have a main
  landmark"** — `app/art/page.tsx` renders `<GatewayPrototype />` directly with no `<main>`
  wrapper, exactly as the original `app/page.tsx` did before this experiment (verified by
  diff: the original had the identical structure). This is a **pre-existing characteristic of
  the frozen Gateway experience**, not a regression introduced by relocating its route. Per
  the explicit instruction not to modify the Gateway's internals without separate approval,
  it is documented here rather than fixed.
- These are lab (simulated-throttling) results from a single run each, not real-user field
  Core Web Vitals data — no field CWV claim is made anywhere in this report.

## Known limitations of this QA pass

- No hosted Preview exists yet (see Vercel isolation section) — all QA is against a local
  production server, not a deployed environment. Preview-specific checks (deployment
  protection headers, Vercel's own environment variables) could not be exercised.
- `prefers-reduced-motion` was verified by source/test inspection, not a live OS-level toggle
  (tooling limitation, noted above).
- No physical-device testing was performed (emulated viewports only, via the browser tool's
  viewport resize).
- Screenshots taken during this session were reviewed live in-session but are not persisted as
  files in this repository or elsewhere; this report describes what was observed rather than
  linking to saved images.
