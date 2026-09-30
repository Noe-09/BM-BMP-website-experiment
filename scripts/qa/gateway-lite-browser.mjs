// Production browser QA. PLAYWRIGHT_MODULE may point to a temporary external install.
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const base = process.env.QA_URL || 'http://127.0.0.1:3102';
const out = 'docs/gateway-lite';
await mkdir(out, { recursive: true });
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const report = { runs: [], routes: [], errors: [] };
const sample = page => page.locator('.gl-canvas').evaluate(el => ({ now: performance.now(), renders: Number(el.dataset.renderCount || 0), calls: Number(el.dataset.sceneDrawCalls || 0), ready: el.dataset.ready }));
const observe = () => {
  window.liteAudit = { states: [], draws: 0, frameCallbacks: 0 };
  const raf = requestAnimationFrame;
  window.requestAnimationFrame = callback => raf.call(window, time => { window.liteAudit.frameCallbacks++; callback(time); });
  for (const proto of [window.WebGLRenderingContext?.prototype, window.WebGL2RenderingContext?.prototype]) if (proto) for (const key of ['drawArrays', 'drawElements', 'drawArraysInstanced', 'drawElementsInstanced']) {
    const original = proto[key]; if (original) proto[key] = function(...args) { window.liteAudit.draws++; return original.apply(this, args); };
  }
  document.addEventListener('DOMContentLoaded', () => {
    let previous;
    const read = () => { const stage = document.querySelector('.gl-presentation')?.dataset.stage; if (stage && stage !== previous) { previous = stage; window.liteAudit.states.push({ stage, ms: performance.now() }); } };
    new MutationObserver(read).observe(document.documentElement, { subtree: true, childList: true, attributes: true, attributeFilter: ['data-stage'] }); read();
  });
};
try {
  for (const config of [{ width: 360 }, { width: 390 }, { width: 768 }, { width: 1024 }, { width: 1440 }, { width: 390, reduced: true }]) {
    const context = await browser.newContext({ viewport: { width: config.width, height: 900 }, isMobile: config.width < 640, hasTouch: config.width < 640, reducedMotion: config.reduced ? 'reduce' : 'no-preference', ...(config.width === 390 && !config.reduced ? { recordVideo: { dir: "/tmp/bmp-gateway-lite-qa/recording", size: { width: 390, height: 900 } } } : {}) });
    await context.addInitScript(observe);
    const page = await context.newPage(); page.on('pageerror', e => report.errors.push(e.message));
    await page.goto(base, { waitUntil: 'domcontentloaded' });
    const selector = page.getByRole('navigation', { name: 'Choose a BMP world' });
    await selector.waitFor();
    const run = { ...config, selectorMs: await page.evaluate(() => performance.now()) };
    assert.equal(await page.locator('h1').count(), 1);
    assert.match(await page.locator('h1').textContent(), /BMP/);
    for (const href of ['/bm-visual', '/creator', '/bm-tech', '/work', '/contact']) assert.ok(await page.locator(`.gl-hero a[href="${href}"]`).isVisible());
    assert.ok(await selector.evaluate(el => el.getBoundingClientRect().bottom <= innerHeight), 'World choices should fit the first viewport');
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    await page.waitForFunction(() => document.querySelector('.gl-canvas')?.dataset.ready === 'true');
    await page.waitForTimeout(config.reduced ? 700 : 2800);
    const before = await sample(page); const glBefore = await page.evaluate(() => window.liteAudit.draws);
    await page.waitForTimeout(1000);
    const after = await sample(page); const glAfter = await page.evaluate(() => window.liteAudit.draws);
    run.idle = { durationMs: after.now - before.now, renders: after.renders - before.renders, webglDraws: glAfter - glBefore };
    assert.equal(run.idle.renders, 0); assert.equal(run.idle.webglDraws, 0);
    run.states = await page.evaluate(() => window.liteAudit.states);
    assert.ok(run.states.every(s => ['signature', 'tunnel', 'selector'].includes(s.stage)));
    if (config.reduced) assert.ok(run.states.every(s => s.stage === 'selector'));
    run.presentationFinishedMs = [...run.states].reverse().find(s => s.stage === 'selector')?.ms;
    run.network = await page.evaluate(() => performance.getEntriesByType('resource').map(e => ({ url: e.name, type: e.initiatorType, encoded: e.encodedBodySize, decoded: e.decodedBodySize, transfer: e.transferSize })));
    if ([360,390,1440].includes(config.width)) await page.screenshot({ path: `${out}/home-${config.width}${config.reduced ? '-reduced' : ''}.png` });
    await page.locator('.gl-contact').scrollIntoViewIfNeeded(); await page.waitForTimeout(300);
    const offBefore = await sample(page); await page.waitForTimeout(700); const offAfter = await sample(page);
    run.offscreenRenders = offAfter.renders - offBefore.renders; assert.equal(run.offscreenRenders, 0);
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    if ([390,1440].includes(config.width) && !config.reduced) await page.screenshot({ path: `${out}/full-${config.width}.png`, fullPage: true });
    await page.evaluate(() => scrollTo(0, 0)); await page.waitForTimeout(350);
    run.navigation = [];
    for (const route of ['/bm-visual', '/creator', '/bm-tech', '/work', '/contact']) {
      const started = Date.now(); await page.locator(`.gl-hero a[href="${route}"]`).click(); await page.waitForURL(base + route); await page.waitForLoadState('domcontentloaded');
      run.navigation.push({ route, taps: 1, elapsedMs: Date.now() - started });
      await page.goBack({ waitUntil: 'domcontentloaded' }); await selector.waitFor();
      assert.ok(await page.locator('.gl-world-grid a').first().isVisible());
    }
    await page.reload({ waitUntil: 'domcontentloaded' }); run.returningSelectorMs = await page.evaluate(() => performance.now());
    await page.waitForTimeout(350); assert.equal(await page.locator('.gl-presentation').getAttribute('data-stage'), 'selector');
    run.returningStates = await page.evaluate(() => window.liteAudit.states); assert.ok(run.returningStates.every(s => s.stage === 'selector'));
    run.noOverflow = true;
    report.runs.push(run);
    const video = page.video(); await context.close();
    if (video) { await video.saveAs(`${out}/gateway-lite-mobile.webm`); run.recording = 'gateway-lite-mobile.webm'; }
    await writeFile(`${out}/browser.json`, JSON.stringify(report, null, 2));
  }
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } }); const page = await context.newPage();
  await page.goto(base); await page.keyboard.press('Tab'); await page.keyboard.press('Tab');
  assert.match(await page.locator(':focus').textContent(), /SKIP/); assert.equal(await page.locator(':focus').evaluate(el => getComputedStyle(el).outlineStyle), 'solid');
  await page.keyboard.press('Enter'); assert.equal(await page.locator(':focus').getAttribute('id'), 'worlds');
  await page.keyboard.press('Tab'); await page.keyboard.press('Enter'); await page.waitForURL(base + '/bm-visual'); report.keyboard = 'Native skip/focus and Enter navigation passed';
  for (const route of ['/work', '/bm-visual', '/creator', '/bm-tech', '/about', '/contact', '/work/fabriclism', '/work/haven', '/creator/weins', '/robots.txt', '/sitemap.xml', '/does-not-exist', '/work/unknown', '/creator/unknown', '/gateway-prototype/review']) {
    const response = await page.goto(base + route, { waitUntil: 'domcontentloaded' }); const expected = /unknown|does-not-exist|\/review/.test(route) ? 404 : 200; assert.equal(response.status(), expected);
    report.routes.push({ route, status: response.status(), title: await page.title() });
  }
  const redirect = await fetch(base + '/gateway-prototype', { redirect: 'manual' }); assert.equal(redirect.status, 307); assert.equal(redirect.headers.get('location'), '/'); report.redirect = '307 to /'; await context.close();
  for (const mode of ['no-js', 'webgl-failure', 'no-storage', 'scene-network-failure']) {
    const context = await browser.newContext({ javaScriptEnabled: mode !== 'no-js', reducedMotion: 'reduce', viewport: { width: 390, height: 844 } });
    if (mode === 'webgl-failure') await context.addInitScript(() => { const get = HTMLCanvasElement.prototype.getContext; HTMLCanvasElement.prototype.getContext = function(type, ...args) { return type.includes('webgl') ? null : get.call(this, type, ...args); }; });
    if (mode === 'no-storage') await context.addInitScript(() => { Storage.prototype.getItem = () => { throw new Error('blocked'); }; Storage.prototype.setItem = () => { throw new Error('blocked'); }; });
    const page = await context.newPage(); if (mode === 'scene-network-failure') await page.route('**/_next/static/chunks/*', route => /bd904|b536|750-/.test(route.request().url()) ? route.abort() : route.continue());
    await page.goto(base, { waitUntil: 'domcontentloaded' });
    assert.equal(await page.locator('h1').count(), 1); for (const href of ['/bm-visual','/creator','/bm-tech','/work','/contact']) assert.ok(await page.locator(`.gl-hero a[href="${href}"]`).isVisible());
    if (mode === 'no-js') await page.screenshot({ path: `${out}/no-js.png`, fullPage: true });
    await page.locator('.gl-hero a[href="/work"]').click(); await page.waitForURL(base + '/work'); report[mode] = 'Semantic content and direct Work link passed'; await context.close();
  }
  assert.deepEqual(report.errors, []);
} finally { await writeFile(`${out}/browser.json`, JSON.stringify(report, null, 2)); await browser.close(); }
console.log(JSON.stringify({ runs: report.runs.map(({ network, ...r }) => r), keyboard: report.keyboard, errors: report.errors, routes: report.routes }, null, 2));
