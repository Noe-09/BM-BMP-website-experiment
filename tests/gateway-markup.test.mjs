import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(path, import.meta.url), "utf8");

test("gateway fallback exposes all three canonical destinations", async () => {
  const source = await read("../components/gateway/GatewayFallback.tsx");

  assert.match(source, /GATEWAY_DIVISIONS/);
  assert.match(source, /getGatewayDestination/);
  assert.doesNotMatch(source, /BM VISUALS|BMP TECHNICAL/);
  assert.doesNotMatch(source, /gateway-prototype\/technical/);
  assert.match(source, /destination\.href/);
  assert.match(source, /destination\.publicLabel/);
  assert.match(source, /destination\.headline/);
});

test("selection previews and briefing decisions have distinct semantics", async () => {
  const selection = await read("../components/gateway/SelectionOverlay.tsx");
  const briefing = await read("../components/gateway/BriefingOverlay.tsx");
  const css = await read("../app/gateway.css");

  assert.match(selection, /GATEWAY_DIVISIONS/);
  assert.match(selection, /getGatewayDestination/);
  assert.match(selection, /destination\.headline/);
  assert.match(selection, /<button/);
  assert.doesNotMatch(selection, /<Link/);
  assert.doesNotMatch(selection, /supportingCopy|helps businesses|Apps, experiments/);
  for (const button of selection.matchAll(/<button\b[^]*?<\/button>/g)) {
    assert.doesNotMatch(button[0], /<Link/);
  }

  assert.match(briefing, /getGatewayDestination/);
  assert.match(briefing, /destination\.description/);
  assert.match(briefing, /role="region"/);
  assert.match(briefing, /aria-live="polite"/);
  assert.match(briefing, /GO BACK/);
  assert.match(briefing, /CONTINUE →/);
  assert.match(briefing, /<Link/);
  assert.match(briefing, /destination\.href/);
  assert.doesNotMatch(briefing, /helps businesses|Apps, experiments/);
  for (const link of briefing.matchAll(/<Link\b[^]*?<\/Link>/g)) {
    assert.doesNotMatch(link[0], /<button/);
  }
  assert.doesNotMatch(
    css,
    /\[data-coarse-pointer="true"\][^}]*pointer-events:/s,
  );
});

test("enhanced selection exposes one quiet canonical master-brand intro", async () => {
  const source = await read("../components/gateway/SelectionOverlay.tsx");
  const css = await read("../app/gateway.css");

  assert.equal(source.match(/<h1\b/g)?.length, 1);
  assert.match(source, /<h1>\s*BM\s*<\/h1>/);
  assert.match(source, /Creative × Technology × Products\./);
  assert.match(source, /className="gateway-selection__intro"/);
  assert.match(source, /className="gateway-core-mark" aria-hidden="true"/);
  assert.match(
    css,
    /\.gateway-selection__intro\s*\{[^}]*position:\s*absolute;[^}]*width:\s*1px;[^}]*height:\s*1px;[^}]*overflow:\s*hidden;/s,
  );
});

test("context cursor adds isolated gateway mode while retaining existing modes", async () => {
  const source = await read("../components/motion/ContextCursor.tsx");
  const css = await read("../app/motion.css");

  assert.match(source, /"gateway"/);
  assert.match(source, /"default"/);
  assert.match(source, /"view"/);
  assert.match(source, /"explore"/);
  assert.match(css, /\.context-cursor\[data-mode="gateway"\]/);
  assert.match(css, /\.context-cursor\[data-mode="view"\],\s*\.context-cursor\[data-mode="explore"\]\s*\{[^}]*width:\s*84px;/s);
});

test("the art route owns the Gateway and Studio owns the former Home", async () => {
  const gateway = await read("../app/art/page.tsx");
  const studio = await read("../app/studio/page.tsx");
  const deprecated = await read("../app/gateway-prototype/page.tsx");

  assert.match(gateway, /gateway\.css/);
  assert.match(gateway, /GatewayPrototype/);
  assert.match(studio, /BmpHero/);
  assert.doesNotMatch(studio, /GatewayPrototype|gateway-prototype/i);
  assert.match(deprecated, /redirect\("\/art"\)/);
});

test("technical prototype route loads the gateway fallback stylesheet directly", async () => {
  const technical = await read("../app/gateway-prototype/technical/page.tsx");

  assert.match(technical, /gateway\.css/);
});

test("gateway canvas is decorative and scene stays dependency-light", async () => {
  const canvas = await read("../components/gateway/TunnelCanvas.tsx");
  const scene = await read("../lib/gateway/scene.ts");

  assert.match(canvas, /aria-hidden="true"/);
  assert.match(scene, /from "three"/);
  assert.doesNotMatch(scene, /@react-three|drei|gsap|postprocessing|EffectComposer/);
  assert.doesNotMatch(scene, /TextureLoader|GLTFLoader/);
});

test("development scene review can inspect all three destination states", async () => {
  const source = await read("../components/gateway/GatewaySceneReview.tsx");

  assert.match(source, /GatewayDivision/);
  assert.match(source, /deriveDestinationInteraction/);
  assert.match(source, /Creator/);
  assert.match(source, /briefingProgress/);
});

test("loader uses BM counter language without percent", async () => {
  const source = await read("../components/gateway/LoaderOverlay.tsx");

  assert.match(source, /INITIALIZING/);
  assert.match(source, /TWO WORLDS\. ONE SYSTEM\./);
  assert.match(source, /SKIP/);
  assert.doesNotMatch(source, /%/);
  assert.doesNotMatch(source, /SESSION RECONNECTED|GATEWAY SEQUENCE/);
});

test("orchestrator owns session resolution, loader modes, fallback timing, and semantic fallback", async () => {
  const source = await read("../components/gateway/GatewayPrototype.tsx");

  assert.match(source, /bmGatewaySeen/);
  assert.match(source, /SESSION_RESOLVED/);
  assert.match(source, /LoaderMode/);
  assert.match(source, /shortLoaderMs/);
  assert.match(source, /fallbackMs/);
  assert.match(source, /GatewayFallback/);
  assert.match(source, /<GatewayFallback/);
  assert.match(source, /getGatewayPresentation/);
  assert.match(source, /enhanced=\{presentation\.enhancementHealthy\}/);
});

test("gateway route renders the shared client orchestrator from a server component", async () => {
  const source = await read("../app/art/page.tsx");

  assert.match(source, /GatewayPrototype/);
  assert.match(source, /BRAND\.positioning\.value/);
  assert.doesNotMatch(source, /noindex|nofollow/);
  assert.doesNotMatch(source, /[\"']use client[\"']/);
});

test("orchestrator owns one frame loop and cleans up travel input ownership", async () => {
  const source = await read("../components/gateway/GatewayPrototype.tsx");

  assert.equal(source.match(/requestAnimationFrame\(/g)?.length, 1);
  assert.equal(source.match(/setTimeout\(/g)?.length, 2);
  assert.match(source, /dragPointerIdRef/);
  assert.match(source, /exitCompleteRef/);
  assert.match(source, /releasePointerCapture/);
  assert.match(source, /removeEventListener\("wheel"/);
  assert.match(source, /removeEventListener\("pointercancel"/);
  assert.match(source, /safetyTimeoutRef/);
  assert.match(source, /cancelAnimationFrame/);
  assert.match(source, /window\.addEventListener\("keydown"/);
  assert.match(source, /window\.removeEventListener\("keydown"/);
});

test("orchestrator integrates semantic selection and preserves native activation paths", async () => {
  const source = await read("../components/gateway/GatewayPrototype.tsx");

  assert.match(source, /SelectionOverlay/);
  assert.match(source, /BriefingOverlay/);
  assert.match(source, /briefingProgress/);
  assert.match(source, /createBriefingTimeline/);
  assert.match(source, /BRIEFING_COMPLETE/);
  assert.match(source, /GO_BACK_COMPLETE/);
  assert.match(source, /previouslySelectedControlRef/);
  assert.match(source, /briefingHeadingRef/);
  assert.match(source, /state\.selectedDivision/);
  assert.match(source, /event\.detail/);
  assert.match(source, /committedGuardRef/);
  assert.match(source, /shouldEnhanceGatewayNavigation/);
  assert.match(source, /shouldMarkGatewaySession/);
  assert.match(source, /router\.push\(href\)/);
  assert.match(source, /window\.location\.assign\(href\)/);
  assert.match(source, /navigationFallbackMs/);
  assert.match(source, /event\.key === "Escape"/);
  assert.match(source, /hidden=\{!presentation\.fallbackActive\}/);
  assert.match(source, /aria-hidden=\{!presentation\.fallbackActive\}/);
});

test("returning visitors can replay in memory without navigation or storage deletion", async () => {
  const orchestrator = await read("../components/gateway/GatewayPrototype.tsx");
  const selection = await read("../components/gateway/SelectionOverlay.tsx");

  assert.match(orchestrator, /handleReplayJourney/);
  assert.match(orchestrator, /journeyRef\.current = createJourney\(0\)/);
  assert.match(orchestrator, /dispatch\(\{ type: "REPLAY_JOURNEY" \}\)/);
  assert.match(
    orchestrator,
    /showReplay=\{state\.returning && state\.phase === "split"\}/,
  );
  assert.doesNotMatch(orchestrator, /sessionStorage\.(?:clear|removeItem)/);
  assert.match(selection, /<button[^>]*className="gateway-selection__replay"/s);
  assert.match(selection, /REPLAY JOURNEY/);
  assert.match(selection, /onReplay/);
});

test("gateway CSS gives the lifecycle owner the top sibling stacking layer", async () => {
  const css = await read("../app/gateway.css");
  const source = await read("../components/gateway/GatewayPrototype.tsx");

  assert.match(source, /data-layer-owner=\{presentation\.layerOwner\}/);
  assert.match(
    css,
    /\.gateway-enhancement\s*\{[^}]*z-index:\s*3;/s,
  );
  assert.match(
    css,
    /\[data-layer-owner="fallback"\][^{]*\.gateway-fallback\s*\{[^}]*z-index:\s*4;/s,
  );
});

test("gateway CSS contains coarse-pointer and reduced-motion modes", async () => {
  const css = await read("../app/gateway.css");

  assert.match(css, /pointer: coarse|hover: none/);
  assert.match(css, /prefers-reduced-motion: reduce/);
  assert.match(css, /100svh/);
});

test("gateway route exposes scoped progressive-enhancement state hooks", async () => {
  const source = await read("../components/gateway/GatewayPrototype.tsx");
  const fallback = await read("../components/gateway/GatewayFallback.tsx");

  assert.match(source, /className="gateway-page gateway-prototype"/);
  assert.match(source, /data-gateway-enhanced=/);
  assert.match(source, /data-gateway-phase=/);
  assert.match(source, /data-gateway-selection=/);
  assert.match(fallback, /gateway-page gateway-fallback/);
});

test("gateway art direction excludes decorative UI effects and visitor-facing errors", async () => {
  const css = await read("../app/gateway.css");
  const fallback = await read("../components/gateway/GatewayFallback.tsx");

  assert.doesNotMatch(css, /gradient\s*\(|backdrop-filter|box-shadow|drop-shadow/i);
  assert.doesNotMatch(
    css,
    /border-radius\s*:\s*(?!0(?:px|rem|em|%)?\s*[;}])[^;}]+/i,
  );
  assert.doesNotMatch(
    fallback,
    /WebGL unsupported|GPU error|stack trace|loading failed/i,
  );
});

test("selection CSS positions all three identities as spatial coordinates", async () => {
  const css = await read("../app/gateway.css");

  assert.match(css, /\.gateway-selection__division--visuals\s*\{/);
  assert.match(css, /\.gateway-selection__division--creator\s*\{/);
  assert.match(css, /\.gateway-selection__division--technical\s*\{/);
  assert.match(css, /\.gateway-selection__summary\s*\{/);
  assert.match(css, /data-depth="foreground"|\[data-depth="foreground"\]/);
});

test("briefing CSS uses left-object and right-editorial composition", async () => {
  const css = await read("../app/gateway.css");

  assert.match(css, /\.gateway-briefing\s*\{[^}]*right:/s);
  assert.match(css, /\.gateway-briefing__headline\s*\{/);
  assert.match(css, /--gateway-briefing-identity/);
  assert.match(css, /--gateway-briefing-description/);
  assert.match(css, /--gateway-briefing-decision/);
  assert.match(css, /\[data-decision-ready="true"\]/);
});

test("mobile and tablet modes preserve complete selection and briefing content", async () => {
  const css = await read("../app/gateway.css");

  assert.match(css, /@media \(max-width: 1023px\)[^]*\.gateway-briefing\s*\{/);
  assert.match(css, /@media \(max-width: 640px\)[^]*\.gateway-selection__name\s*\{[^}]*overflow-wrap:\s*normal;/);
  assert.match(css, /@media \(max-width: 640px\)[^]*\.gateway-briefing__description\s*\{/);
});

test("coarse preview exposes a deliberate second-step selection affordance", async () => {
  const css = await read("../app/gateway.css");

  assert.match(css, /@media \(hover: none\), \(pointer: coarse\)[^]*\.gateway-selection__activate\s*\{/);
  assert.match(css, /min-height:\s*2\.75rem/);
});
