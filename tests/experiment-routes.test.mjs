import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (p) => readFile(new URL(p, import.meta.url), "utf8");

test("Gateway is owned by /art rather than root", async () => {
  const art = await read("../app/art/page.tsx");
  const root = await read("../app/page.tsx");

  assert.match(art, /GatewayPrototype/);
  assert.match(art, /gateway\.css/);
  assert.doesNotMatch(root, /GatewayPrototype|TunnelCanvas|three/);
});

test("the deprecated gateway-prototype route now points at /art", async () => {
  const deprecated = await read("../app/gateway-prototype/page.tsx");

  assert.match(deprecated, /redirect\("\/art"\)/);
});

test("the technical prototype demo route links back to /art", async () => {
  const technical = await read("../app/gateway-prototype/technical/page.tsx");

  assert.match(technical, /gateway\.css/);
  assert.match(technical, /href="\/art"/);
});
