import assert from "node:assert/strict";
import test from "node:test";
import {
  acquireGatewayCommitLock,
  getGatewayExpectedPathname,
  shouldEnhanceGatewayNavigation,
  shouldClearGatewayPreview,
  shouldMarkGatewaySession,
  shouldPreviewGatewayFocus,
  shouldPreviewGatewaySelection,
  shouldRequireGatewayPreview,
  shouldUseGatewayLocationFallback,
} from "../lib/gateway/navigation.ts";

const primary = {
  button: 0,
  detail: 1,
  defaultPrevented: false,
  metaKey: false,
  ctrlKey: false,
  shiftKey: false,
  altKey: false,
  target: undefined,
  download: false,
  reducedMotion: false,
  enhancementReady: true,
};

test("gateway enhances only an ordinary primary-pointer activation", () => {
  assert.equal(shouldEnhanceGatewayNavigation(primary), true);
  assert.equal(shouldEnhanceGatewayNavigation({ ...primary, button: 1 }), false);
  assert.equal(shouldEnhanceGatewayNavigation({ ...primary, button: 2 }), false);
  assert.equal(shouldEnhanceGatewayNavigation({ ...primary, detail: 0 }), false);
  assert.equal(shouldEnhanceGatewayNavigation({ ...primary, defaultPrevented: true }), false);
  assert.equal(shouldEnhanceGatewayNavigation({ ...primary, ctrlKey: true }), false);
  assert.equal(shouldEnhanceGatewayNavigation({ ...primary, metaKey: true }), false);
  assert.equal(shouldEnhanceGatewayNavigation({ ...primary, shiftKey: true }), false);
  assert.equal(shouldEnhanceGatewayNavigation({ ...primary, altKey: true }), false);
  assert.equal(shouldEnhanceGatewayNavigation({ ...primary, target: "_blank" }), false);
  assert.equal(shouldEnhanceGatewayNavigation({ ...primary, target: "external-frame" }), false);
  assert.equal(shouldEnhanceGatewayNavigation({ ...primary, download: true }), false);
  assert.equal(shouldEnhanceGatewayNavigation({ ...primary, reducedMotion: true }), false);
  assert.equal(shouldEnhanceGatewayNavigation({ ...primary, enhancementReady: false }), false);
});

test("same-context keyboard activation marks the session without enhancing navigation", () => {
  const keyboard = { ...primary, detail: 0 };

  assert.equal(shouldEnhanceGatewayNavigation(keyboard), false);
  assert.equal(shouldMarkGatewaySession(keyboard), true);
  assert.equal(shouldMarkGatewaySession({ ...keyboard, button: 2 }), false);
  assert.equal(shouldMarkGatewaySession({ ...keyboard, metaKey: true }), false);
  assert.equal(shouldMarkGatewaySession({ ...keyboard, target: "_blank" }), false);
  assert.equal(shouldMarkGatewaySession({ ...keyboard, download: true }), false);
});

test("coarse ordinary pointer activation requires its division preview first", () => {
  assert.equal(
    shouldRequireGatewayPreview(primary, {
      coarsePointer: true,
      division: "visuals",
      selectedDivision: null,
    }),
    true,
  );
  assert.equal(
    shouldRequireGatewayPreview(primary, {
      coarsePointer: true,
      division: "visuals",
      selectedDivision: "technical",
    }),
    true,
  );
  assert.equal(
    shouldRequireGatewayPreview(primary, {
      coarsePointer: true,
      division: "visuals",
      selectedDivision: "visuals",
    }),
    false,
  );
});

test("coarse Creator selection previews once before deliberate selection", () => {
  assert.equal(
    shouldPreviewGatewaySelection({
      coarsePointer: true,
      division: "creator",
      previewDivision: null,
    }),
    true,
  );
  assert.equal(
    shouldPreviewGatewaySelection({
      coarsePointer: true,
      division: "creator",
      previewDivision: "technical",
    }),
    true,
  );
  assert.equal(
    shouldPreviewGatewaySelection({
      coarsePointer: true,
      division: "creator",
      previewDivision: "creator",
    }),
    false,
  );
  assert.equal(
    shouldPreviewGatewaySelection({
      coarsePointer: false,
      division: "creator",
      previewDivision: null,
    }),
    false,
  );
});

test("coarse pointer focus previews only when focus is visibly keyboard-driven", () => {
  assert.equal(
    shouldPreviewGatewayFocus({ coarsePointer: true, focusVisible: false }),
    false,
  );
  assert.equal(
    shouldPreviewGatewayFocus({ coarsePointer: true, focusVisible: true }),
    true,
  );
  assert.equal(
    shouldPreviewGatewayFocus({ coarsePointer: false, focusVisible: false }),
    true,
  );
});

test("touch pointer leave and focus churn preserve the first-tap Gateway preview", () => {
  assert.equal(
    shouldClearGatewayPreview({ coarsePointer: true, pointerType: "touch" }),
    false,
  );
  assert.equal(shouldClearGatewayPreview({ coarsePointer: true }), false);
  assert.equal(
    shouldClearGatewayPreview({ coarsePointer: false, pointerType: "touch" }),
    false,
  );
  assert.equal(
    shouldClearGatewayPreview({ coarsePointer: false, pointerType: "mouse" }),
    true,
  );
  assert.equal(shouldClearGatewayPreview({ coarsePointer: false }), true);
});

test("coarse preview gate leaves fine, keyboard, modified, and reduced-motion activation native", () => {
  const context = {
    coarsePointer: true,
    division: "technical",
    selectedDivision: null,
  };

  assert.equal(
    shouldRequireGatewayPreview(primary, { ...context, coarsePointer: false }),
    false,
  );
  assert.equal(shouldRequireGatewayPreview({ ...primary, detail: 0 }, context), false);
  assert.equal(shouldRequireGatewayPreview({ ...primary, metaKey: true }, context), false);
  assert.equal(shouldRequireGatewayPreview({ ...primary, button: 1 }, context), false);
  assert.equal(shouldRequireGatewayPreview({ ...primary, button: 2 }, context), false);
  assert.equal(
    shouldRequireGatewayPreview({ ...primary, target: "_blank" }, context),
    false,
  );
  assert.equal(shouldRequireGatewayPreview({ ...primary, download: true }, context), false);
  assert.equal(shouldRequireGatewayPreview({ ...primary, reducedMotion: true }, context), false);
  assert.equal(
    shouldRequireGatewayPreview({ ...primary, enhancementReady: false }, context),
    false,
  );
  assert.equal(
    shouldRequireGatewayPreview({ ...primary, defaultPrevented: true }, context),
    false,
  );
});

test("commit lock is acquired synchronously only once", () => {
  const lock = { current: false };

  assert.equal(acquireGatewayCommitLock(lock), true);
  assert.equal(lock.current, true);
  assert.equal(acquireGatewayCommitLock(lock), false);
});

test("navigation fallback compares the parsed destination pathname", () => {
  const expected = getGatewayExpectedPathname(
    "/gateway-prototype/technical?from=split#entry",
    "https://bm.test/gateway-prototype",
  );

  assert.equal(expected, "/gateway-prototype/technical");
  assert.equal(shouldUseGatewayLocationFallback("/gateway-prototype", expected), true);
  assert.equal(
    shouldUseGatewayLocationFallback("/gateway-prototype/technical", expected),
    false,
  );
});

test("navigation fallback also resolves the relocated /art gateway pathname", () => {
  const expected = getGatewayExpectedPathname("/art?from=split#entry", "https://bm.test/art");

  assert.equal(expected, "/art");
  assert.equal(shouldUseGatewayLocationFallback("/gateway-prototype", expected), true);
  assert.equal(shouldUseGatewayLocationFallback("/art", expected), false);
});
