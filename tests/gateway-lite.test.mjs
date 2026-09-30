import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
const read = p => readFile(new URL(p, import.meta.url), 'utf8');
const lifecycle = () => import('../lib/gateway/lite.ts');

test('lite timeline has only signature, tunnel and selector, with a shorter mobile passage', async () => {
  const { getLiteFrame } = await lifecycle();
  for (const mobile of [false, true]) {
    assert.equal(getLiteFrame(0, { mobile }).stage, 'signature');
    assert.equal(getLiteFrame(750, { mobile }).stage, 'tunnel');
    assert.equal(getLiteFrame(mobile ? 1750 : 2250, { mobile }).stage, 'selector');
    assert.equal(getLiteFrame(9000, { mobile }).progress, 1);
  }
});

test('returning, reduced motion and Skip select immediately without asset readiness gates', async () => {
  const { getLiteFrame } = await lifecycle();
  for (const options of [{ returning: true }, { reducedMotion: true }, { skipped: true }]) {
    assert.deepEqual(getLiteFrame(0, options), { stage: 'selector', progress: 1 });
  }
});

test('render scheduler sleeps when idle, hidden or offscreen and wakes only for actual work', async () => {
  const { shouldRenderLite } = await lifecycle();
  const idle = { visible: true, hidden: false, dirty: false, settlingUntil: 0, now: 1000, reducedMotion: false };
  assert.equal(shouldRenderLite(idle), false);
  assert.equal(shouldRenderLite({ ...idle, dirty: true }), true);
  assert.equal(shouldRenderLite({ ...idle, settlingUntil: 1200 }), true);
  assert.equal(shouldRenderLite({ ...idle, settlingUntil: 1200, reducedMotion: true }), false);
  assert.equal(shouldRenderLite({ ...idle, dirty: true, hidden: true }), false);
  assert.equal(shouldRenderLite({ ...idle, dirty: true, visible: false }), false);
});

test('root keeps semantic navigation separate from presentation, without mandatory Continue', async () => {
  const source = await read('../app/page.tsx');
  assert.match(source, /GatewayLite/);
  assert.doesNotMatch(source, /GatewayPrototype|BriefingOverlay|LoaderOverlay|CONTINUE/);
  assert.equal(source.match(/<h1\b/g)?.length, 1);
  assert.match(source, /BMP/);
  for (const route of ['/work', '/contact']) assert.ok(source.includes(`href="${route}"`));
});

test('canonical origin fails closed and sitemap uses only an explicitly configured public origin', async () => {
  const { confirmedOrigin, getSitemapEntries } = await import('../lib/seo.ts');
  for (const value of [undefined, '', 'http://localhost:3000', 'https://example.com/path', 'https://user:pass@example.com', 'not a url']) assert.equal(confirmedOrigin(value), null);
  assert.deepEqual(getSitemapEntries(null), []);
  const entries = getSitemapEntries('https://confirmed-fixture.test');
  for (const route of ['', '/work', '/bm-visual', '/creator', '/bm-tech', '/about', '/contact', '/work/fabriclism']) assert.ok(entries.some(e => e.url === `https://confirmed-fixture.test${route}`));
  assert.ok(!entries.some(e => /gateway-prototype/.test(e.url)));
});
