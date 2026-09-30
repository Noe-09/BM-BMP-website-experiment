import assert from 'node:assert/strict';
import { writeFile } from 'node:fs/promises';
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const base = process.env.QA_URL || 'http://127.0.0.1:3100';
const results = [];
try {
  for (const width of [390, 1440]) {
    const context = await browser.newContext({ viewport: { width, height: 900 }, isMobile: width === 390, hasTouch: width === 390 });
    const page = await context.newPage();
    await page.goto(`${base}/art`);
    const skip = page.getByRole('button', { name: 'SKIP', exact: true });
    await skip.waitFor({ state: 'visible', timeout: 20000 });
    await skip.click();
    const choice = page.locator('.gateway-selection__division--visuals .gateway-selection__preview');
    await choice.waitFor({ state: 'visible', timeout: 20000 });
    await page.screenshot({ path: `docs/fast-entry/art-selection-${width}.png` });
    await choice.click();
    if (width === 390) {
      assert.equal(await choice.getAttribute('aria-pressed'), 'true');
      await choice.click();
    }
    const enter = page.locator('.gateway-briefing a[href="/bm-visual"]');
    await enter.waitFor({ state: 'visible', timeout: 15000 });
    await enter.click();
    await page.waitForURL(`${base}/bm-visual`, { timeout: 20000 });
    await page.getByRole('link', { name: 'Switch World', exact: true }).first().click();
    await page.waitForURL(`${base}/art`);
    await page.reload();
    await page.locator('.gateway-prototype').waitFor();
    results.push({ width, enhancedGateway: true, selection: 'visuals', touchPreview: width === 390, divisionEntry: true, switchWorld: '/art', reload: true });
    await context.close();
  }
} finally {
  await writeFile('docs/fast-entry/gateway.json', JSON.stringify(results, null, 2));
  await browser.close();
}
console.log(JSON.stringify(results, null, 2));
