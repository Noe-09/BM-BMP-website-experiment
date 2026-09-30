# Gateway Lite QA

Branch: `experiment/gateway-lite-seo-v1`  
Baseline: `fd66811f7fb96c0a733ec8b1915d305af6db50ae`

The root keeps the Gateway as the hero while permanently rendering the semantic heading, business description, three world links, Work, and Contact. The new presentation has only `signature → tunnel → selector`; it does not gate navigation on WebGL, fonts, fake progress, or a briefing state. World links are native anchors and take one click or tap.

Browser QA used a production build in headless Chrome at 360, 390, 768, 1024, and 1440px. Selector availability was immediate from server HTML. The optional presentation reached its selector in approximately 1.8s on mobile and 2.3s on desktop. Returning and reduced-motion runs were selector-only. All five primary links passed with one tap, including back and reload. There was no horizontal overflow, and keyboard skip/focus passed. JavaScript disabled, WebGL failure, blocked storage, and failed scene chunk runs still exposed and navigated through the same semantic HTML.

Idle and offscreen samples reported zero additional renders and WebGL draws. Headless Chrome did not expose a usable WebGL context in this environment, so this is a scheduler/lifecycle result; the renderer also has an explicit invalidation path for real WebGL contexts.

The baseline had approximately 26 seconds to selection, a 5 second briefing, multi-tap mobile entry, and continuous idle rendering. The implementation removes those gates while preserving the existing scene, materials, entities, hidden-tab pause, cleanup, and procedural visual identity.

SEO additions are `app/robots.ts`, `app/sitemap.ts`, and `lib/seo.ts`. Since no production origin was confirmed, the experiment defaults to `noindex, follow`, emits no invented canonical URLs, and returns a valid empty sitemap. Set `BMP_CONFIRMED_ORIGIN` plus `BMP_ALLOW_INDEXING=true` only for a confirmed public deployment.

Evidence: `browser.json`, `gateway-lite-mobile.webm`, `home-360.png`, `home-390.png`, `home-1440.png`, `full-390.png`, `full-1440.png`, `home-390-reduced.png`, and `no-js.png`. The implementation report deliberately records the headless WebGL limitation rather than claiming GPU draw counts that were not measured.
