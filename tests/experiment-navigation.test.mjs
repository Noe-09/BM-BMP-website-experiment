import assert from "node:assert/strict";
import test from "node:test";
import { NAVIGATION } from "../content/navigation.ts";

test("experiment nav keeps commerce root and art separate", () => {
  assert.equal(NAVIGATION.studio.href.value, "/");
  assert.equal(NAVIGATION.gateway.href.value, "/art");
  assert.ok(NAVIGATION.items.some((x) => x.href.value === "/work"));
  assert.ok(NAVIGATION.items.some((x) => x.href.value === "/contact"));
});

test("Contact remains the last, styled primary-action item", () => {
  const last = NAVIGATION.items[NAVIGATION.items.length - 1];
  assert.equal(last.href.value, "/contact");
});
