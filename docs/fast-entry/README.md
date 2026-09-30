# BMP fast entry experiment

Repository: `Noe-09/BM-BMP-website-experiment`  
Branch: `experiment/fast-entry-v1`  
Baseline: `fd66811f7fb96c0a733ec8b1915d305af6db50ae`  
Implementation history: `git log --oneline fd66811..experiment/fast-entry-v1`

## Result

`/` is a statically prerendered, server-component homepage: hero, two verified Concept projects (Fabriclism and Haven), three service areas, optional art entry, and contact/footer. Native links avoid speculative route prefetch. The shared custom cursor is disabled on `/` only. No new client component or dependency was added.

`/art` renders the original Gateway. Its components, scene code, styling, and interaction model are byte-for-byte unchanged from the baseline. The deprecated prototype redirects to `/art`, its technical fallback links back to `/art`, and shared Switch World navigation now points to `/art`.

Work, BM Visual, BM Tech, Creator, About, Contact, project detail pages, project records, and production domain/canonical configuration were not redesigned or edited.

## Verification

- Baseline: 216/216 tests passed before implementation.
- Final: 217/217 tests passed; typecheck, lint, production build, and `git diff --check` passed.
- The build marks `/` and `/art` as statically prerendered.
- Browser: real headless Chrome against `next start`, not a development server.
- 360, 390, 768, 1024, 1440px: no horizontal overflow; both hero CTAs visible above the fold; services anchor and Work/Contact navigation pass; browser back and reload pass.
- Work, Contact, all three division pages, About, Fabriclism and Haven detail pages respond 200 and have one H1.
- Keyboard skip link has a visible focus outline and moves focus into main content.
- Homepage remains readable and actionable with JavaScript disabled.
- Reduced motion: homepage transitions disabled; all three original Gateway destination flows, back and reload pass at 390px.
- Animated Gateway: fresh entry, Skip, selection, briefing, BM Visual navigation, Switch World return and reload pass at 390 and 1440px. Mobile uses the original two-tap preview/selection behavior.
- No page JavaScript errors in the browser route sweep.

The initial concurrent build/test attempt collided over Next's generated type files. Sequential reruns passed. Route assertions that previously expected Gateway at `/` were migrated to `/art`. Browser tests were corrected to exercise the original reduced-motion selection/briefing UI rather than assume it uses fallback links.

## Bundle and network evidence

`bundle.json` records emitted script chunks and byte sizes from the production HTML and client reference manifests. Next includes unused module names with empty chunk references in these manifests; the check examines non-empty references and actual emitted HTML scripts.

The homepage route chunk is **1,005 bytes raw / 500 bytes gzip**. Modern homepage scripts total **466,697 bytes raw / 139,072 bytes gzip**, including Next/React, layout and image components. Including the legacy nomodule polyfill, emitted scripts total **579,291 bytes raw / 178,699 bytes gzip**. These are file/compression measurements, not claimed network transfer sizes.

Gateway/Three chunks are absent from home script entries. `browser.json` records fresh-home requests through a full scroll: none match the identified Gateway/Three chunks; no GLB, GLTF, KTX2 or HDR assets are requested. `/art` does request the isolated heavy chunks. The QA scripts assert both sides so the check cannot pass merely because no heavy chunks were detected.

## Lighthouse 13.5.0 — local production build

| Preset | Performance | Accessibility | Best practices | SEO | LCP | TBT | CLS |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Mobile | 99 | 100 | 100 | 100 | 2.2 s | 0 ms | 0 |
| Desktop | 100 | 100 | 100 | 100 | 0.4 s | 0 ms | 0 |

Single measured run per preset against `http://127.0.0.1:3100`, using Chrome headless and default preset throttling. Full metrics and settings are in `lighthouse.json`.

## Evidence files

- `home-360.png`, `home-390.png`, `home-1440.png`: full-page final homepage screenshots.
- `art-selection-390.png`, `art-selection-1440.png`: original animated Gateway selection.
- `art-reduced-390.png`: reduced-motion Gateway.
- `art-1440.png`: fresh Gateway entry.
- `browser.json`, `gateway.json`, `bundle.json`: structured checks and network evidence.
- `build.txt`, `tests.txt`: command output.
- `lighthouse.json`: actual local Lighthouse measurements and metrics.

## Reproduce

Run commands sequentially because existing dev-server tests write Next's generated types:

```sh
npm test
npm run build
npm run typecheck
npm run lint
git diff --check
node scripts/qa/fast-entry-bundle.mjs > docs/fast-entry/bundle.json
npm start -- --port 3100
```

In a second shell, run the two scripts under `scripts/qa/` ending in `browser.mjs` and `gateway.mjs`, setting `PLAYWRIGHT_MODULE` to an installed Playwright module if it is not in local dependencies. QA used Playwright and Lighthouse installed in a temporary directory, without changing application dependencies or the lockfile.

## Limits and preservation

Lighthouse is a local lab measurement, not field data or a deployed-site guarantee. Existing shared framework/CSS costs remain; Lighthouse flags unused/legacy JavaScript and render-blocking resources. Contact delivery was not submitted or tested against an external provider. Browser coverage is Chrome with emulated viewport/touch settings, not a physical-device or cross-browser certification.

The original production repository/V1 is untouched and clean. No production push, PR, merge or deployment was performed. The old `experiment/business-first-landing` branch remains at `abf5e79deebdc1cf0d03fa0dadda2706db062ace`. An unrelated untracked `.claude/` directory in the experiment checkout was left untouched and excluded from commits.
