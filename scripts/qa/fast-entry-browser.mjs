// Usage: PLAYWRIGHT_MODULE=/absolute/path/to/playwright/index.mjs node scripts/qa/fast-entry-browser.mjs
// Run against npm start -- --port 3100 after the production build.
import assert from 'node:assert/strict';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const base = process.env.QA_URL || 'http://127.0.0.1:3100';
const output = 'docs/fast-entry';
await mkdir(output, { recursive: true });
const bundles = JSON.parse(await readFile(`${output}/bundle.json`, 'utf8'));
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const results = { viewports: [], routes: [], errors: [], network: {} };
try {
  for (const width of [360, 390, 768, 1024, 1440]) {
    const context = await browser.newContext({ viewport: { width, height: width < 640 ? 844 : 1000 }, isMobile: width < 640, hasTouch: width < 640 });
    const page = await context.newPage();
    const requests = [];
    page.on('request', r => requests.push(r.url()));
    page.on('pageerror', e => results.errors.push(e.message));
    await page.goto(base, { waitUntil: 'networkidle' });
    assert.equal(await page.locator('h1').count(), 1);
    assert.equal(await page.locator('canvas').count(), 0);
    assert.ok(await page.getByRole('link', { name: 'VIEW WORK', exact: true }).isVisible());
    const cta = await page.getByRole('link', { name: 'START A PROJECT', exact: true }).first().boundingBox();
    assert.ok(cta.y + cta.height <= page.viewportSize().height, `${width}: hero CTA below fold`);
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${width}: horizontal overflow`);
    await page.getByRole('link', { name: 'SERVICES', exact: true }).click();
    assert.ok(await page.locator('#services').evaluate(el => Math.abs(el.getBoundingClientRect().top) < 50));
    await page.locator('footer').scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);
    assert.ok(!requests.some(url => bundles.heavyChunks.some(chunk => url.includes(chunk))), `${width}: heavy code fetched on homepage`);
    assert.ok(!requests.some(url => /\.(glb|gltf|ktx2|hdr)(\?|$)/.test(url)), '3D assets fetched');
    await page.evaluate(() => scrollTo(0, 0));
    if ([360, 390, 1440].includes(width)) await page.screenshot({ path: `${output}/home-${width}.png`, fullPage: true });
    results.viewports.push({ width, noOverflow: true, heroActionsAboveFold: true, servicesAnchor: true, noGatewayRequests: true });
    if (width === 1440) results.network.home = [...requests];
    // Native links, back navigation and reload from the page itself.
    await page.getByRole('link', { name: 'VIEW WORK', exact: true }).click();
    await page.waitForURL(`${base}/work`);
    await page.goBack({ waitUntil: 'networkidle' });
    await page.reload({ waitUntil: 'networkidle' });
    assert.equal(await page.locator('.fast-entry').count(), 1);
    await page.getByRole('link', { name: 'START A PROJECT', exact: true }).first().click();
    await page.waitForURL(`${base}/contact`);
    await context.close();
  }
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  const page = await context.newPage();
  page.on('pageerror', e => results.errors.push(e.message));
  await page.goto(base, { waitUntil: 'networkidle' });
  await page.keyboard.press('Tab');
  assert.equal(await page.locator(':focus').textContent(), 'Skip to content');
  assert.ok(await page.locator(':focus').evaluate(el => getComputedStyle(el).outlineStyle !== 'none'));
  await page.keyboard.press('Enter');
  assert.equal(await page.locator(':focus').getAttribute('id'), 'main');
  results.keyboard = 'Skip link focuses main; visible focus outline';
  for (const route of ['/work', '/contact', '/bm-visual', '/bm-tech', '/creator', '/about', '/work/fabriclism', '/work/haven']) {
    const response = await page.goto(`${base}${route}`, { waitUntil: 'networkidle' });
    assert.equal(response.status(), 200);
    assert.equal(await page.locator('h1').count(), 1);
    results.routes.push({ route, status: response.status() });
  }
  const artRequests = [];
  page.on('request', r => artRequests.push(r.url()));
  await page.goto(`${base}/art`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  assert.equal(await page.locator('.gateway-prototype').count(), 1);
  assert.ok(artRequests.some(url => bundles.heavyChunks.some(chunk => url.includes(chunk))), 'Art must load Gateway/Three');
  results.network.art = artRequests;
  await page.screenshot({ path: `${output}/art-1440.png` });
  await context.close();
  // Reduced motion retains the original Gateway selection and briefing controls.
  const reduced = await browser.newContext({ reducedMotion: 'reduce', viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const rp = await reduced.newPage();
  await rp.goto(base, { waitUntil: 'networkidle' });
  assert.equal(await rp.locator('.fe-button').first().evaluate(el => getComputedStyle(el).transitionDuration), '0s');
  await rp.getByRole('link', { name: 'EXPLORE ART', exact: true }).first().click();
  await rp.waitForURL(`${base}/art`);
  await rp.waitForLoadState('networkidle');
  assert.equal(await rp.locator('.gateway-prototype').count(), 1);
  await rp.locator('.gateway-selection__preview').first().waitFor({ state: 'visible', timeout: 20000 });
  await rp.screenshot({ path: `${output}/art-reduced-390.png`, fullPage: true });
  for (const [division, destination] of [['visuals', '/bm-visual'], ['technical', '/bm-tech'], ['creator', '/creator']]) {
    const choice = rp.locator(`.gateway-selection__division--${division} .gateway-selection__preview`);
    await choice.waitFor({ state: 'visible', timeout: 20000 });
    await choice.click();
    if (await choice.isVisible()) await choice.click();
    const link = rp.locator(`a[href="${destination}"]:visible`).first();
    await link.click();
    await rp.waitForURL(`${base}${destination}`);
    await rp.goBack({ waitUntil: 'networkidle' });
    await rp.reload({ waitUntil: 'networkidle' });
    assert.equal(await rp.locator('.gateway-prototype').count(), 1);
  }
  results.reducedMotion = 'No homepage transition; all 3 Gateway destinations, back and reload passed at 390px';
  await reduced.close();
  const nojs = await browser.newContext({ javaScriptEnabled: false });
  const np = await nojs.newPage();
  await np.goto(base);
  assert.equal(await np.locator('h1').count(), 1);
  assert.ok(await np.getByRole('link', { name: 'VIEW WORK', exact: true }).isVisible());
  results.noJavaScript = 'Headline, work and contact links rendered';
  await nojs.close();
  assert.deepEqual(results.errors, []);
} finally {
  await writeFile(`${output}/browser.json`, JSON.stringify(results, null, 2));
  await browser.close();
}
console.log(JSON.stringify({ ...results, network: { homeRequests: results.network.home?.length, artRequests: results.network.art?.length } }, null, 2));
