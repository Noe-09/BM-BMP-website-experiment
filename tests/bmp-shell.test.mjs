import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { readFile } from "node:fs/promises";
import net from "node:net";
import test, { after, before } from "node:test";

const nextBin = new URL("../node_modules/next/dist/bin/next", import.meta.url);
let server;
let baseUrl;

async function reservePort() {
  return await new Promise((resolve, reject) => {
    const listener = net.createServer();
    listener.once("error", reject);
    listener.listen(0, "127.0.0.1", () => {
      const address = listener.address();
      const port = typeof address === "object" && address ? address.port : 0;
      listener.close((error) => (error ? reject(error) : resolve(port)));
    });
  });
}

async function waitForServer(url) {
  let lastError;
  for (let attempt = 0; attempt < 80; attempt += 1) {
    try {
      const response = await fetch(url);
      if (response.status < 500) return;
    } catch (error) {
      lastError = error;
    }
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw lastError ?? new Error(`Timed out waiting for ${url}`);
}

before(async () => {
  const port = await reservePort();
  const requestedUrl = `http://127.0.0.1:${port}`;
  server = spawn(
    process.execPath,
    [
      nextBin.pathname,
      "dev",
      "--webpack",
      "--hostname",
      "127.0.0.1",
      "--port",
      String(port),
    ],
    {
      cwd: new URL("..", import.meta.url),
      env: { ...process.env, NEXT_TELEMETRY_DISABLED: "1" },
      stdio: ["ignore", "pipe", "pipe"],
    },
  );
  let startupOutput = "";
  const startup = new Promise((resolve, reject) => {
    let settled = false;
    let readyTimer;
    const finish = (callback) => {
      if (settled) return;
      settled = true;
      if (readyTimer) clearTimeout(readyTimer);
      callback();
    };
    const inspect = (chunk) => {
      startupOutput += chunk.toString();
      const existing = startupOutput.match(
        /existing server at (http:\/\/[^,\s]+)/i,
      )?.[1];
      if (existing) {
        finish(() => {
          baseUrl = existing.replace("localhost", "127.0.0.1");
          server = undefined;
          resolve();
        });
        return;
      }
      if (/Ready in/i.test(startupOutput) && !readyTimer) {
        readyTimer = setTimeout(() => {
          if (server?.exitCode === null) {
            finish(() => {
              baseUrl = requestedUrl;
              resolve();
            });
          }
        }, 2_000);
      }
    };
    server.stdout.on("data", inspect);
    server.stderr.on("data", inspect);
    server.once("error", reject);
    server.once("exit", (code) => {
      if (!settled && !/existing server at/i.test(startupOutput)) {
        finish(() =>
          reject(new Error(`Next dev exited with ${code}: ${startupOutput}`)),
        );
      }
    });
  });
  await startup;
  await waitForServer(baseUrl);
});

after(async () => {
  if (!server || server.exitCode !== null) return;
  server.kill("SIGTERM");
  await new Promise((resolve) => {
    server.once("exit", resolve);
    setTimeout(resolve, 2_000);
  });
});

test("canonical public routes render through one BMP shell", async () => {
  const routes = [
    "/studio",
    "/work",
    "/bm-visual",
    "/bm-tech",
    "/creator",
    "/about",
    "/contact",
  ];

  for (const route of routes) {
    const response = await fetch(`${baseUrl}${route}`);
    const html = await response.text();
    assert.equal(response.status, 200, `${route} should render`);
    assert.equal(html.match(/<h1\b/g)?.length, 1, `${route} should have one h1`);
    assert.match(html, /aria-label="Primary navigation"/);
    assert.match(html, />BMP</);
  }
});

test("the experiment root serves Gateway Lite with descriptive metadata", async () => {
  const response = await fetch(baseUrl);
  const html = await response.text();

  assert.equal(response.status, 200);
  assert.match(html, /class="gateway-lite"/);
  assert.match(html, /<title>BMP — Creative × Technology × Products<\/title>/);
  assert.match(
    html,
    /<meta name="description" content="BMP is a creative-tech studio turning business problems and ideas into brands, digital systems, and products\."/,
  );
  assert.match(html, /noindex/);
  assert.doesNotMatch(html, /nofollow/);
  assert.doesNotMatch(html, /<title>BM Gateway — Three Worlds/);
});

test("Studio preserves the former Home composition with distinct metadata", async () => {
  const response = await fetch(`${baseUrl}/studio`);
  const html = await response.text();

  assert.equal(response.status, 200);
  assert.match(html, /class="bmp-page bmp-home"/);
  assert.match(
    html,
    /<title>BMP Studio — Creative × Technology × Products<\/title>/,
  );
  assert.match(
    html,
    /<meta name="description" content="BMP is a creative-tech studio turning business problems and ideas into brands, digital systems, and products\."/,
  );
  assert.match(html, /noindex/);
  assert.doesNotMatch(html, /nofollow/);
});

test("the deprecated prototype redirects to the canonical root", async () => {
  const response = await fetch(`${baseUrl}/gateway-prototype`, {
    redirect: "manual",
  });

  assert.equal(response.status, 307);
  assert.equal(response.headers.get("location"), "/");
});

test("all public destinations remain directly accessible", async () => {
  for (const path of [
    "/bm-visual",
    "/bm-tech",
    "/creator",
    "/studio",
    "/work",
    "/about",
    "/contact",
  ]) {
    const response = await fetch(`${baseUrl}${path}`, { redirect: "manual" });
    assert.equal(response.status, 200, `${path} should render directly`);
    assert.equal(response.headers.get("location"), null, `${path} should not redirect`);
  }
});

test("the restrained Studio navigation exposes every canonical destination", async () => {
  const response = await fetch(`${baseUrl}/studio`);
  const html = await response.text();

  for (const href of [
    "/",
    "/studio",
    "/work",
    "/bm-visual",
    "/bm-tech",
    "/creator",
    "/about",
    "/contact",
  ]) {
    assert.match(html, new RegExp(`href="${href}"`));
  }
  assert.doesNotMatch(html, />Pricing</i);
  assert.doesNotMatch(html, />Platform</i);
  assert.doesNotMatch(html, />Solutions</i);
});

test("the responsive Studio shell uses an intentional compact menu without hiding destinations", async () => {
  const response = await fetch(`${baseUrl}/studio`);
  const html = await response.text();
  const css = await readFile(new URL("../app/bmp.css", import.meta.url), "utf8");
  const mobileStart = css.indexOf("@media (max-width: 900px)");
  const mobileEnd = css.indexOf("@media (prefers-reduced-motion: reduce)");
  const mobileRules = css.slice(mobileStart, mobileEnd);

  assert.match(html, /<details[^>]+class="compact-nav"/);
  assert.match(html, /aria-label="Compact navigation"/);
  assert.match(mobileRules, /\.bmp-header__nav\s*\{[\s\S]*?display:\s*none/);
  assert.match(mobileRules, /\.compact-nav\s*\{[\s\S]*?display:\s*block/);
  assert.doesNotMatch(css, /\.bmp-header__nav a:nth-child/);
});


test("Gateway Lite permanently renders one descriptive heading and direct destination anchors", async () => {
  const html = await (await fetch(baseUrl)).text();
  assert.equal(html.match(/<h1\b/g)?.length, 1);
  assert.match(html, /<h1[^>]*>BMP/);
  for (const route of ["/bm-visual", "/creator", "/bm-tech", "/work", "/contact"]) assert.ok(html.includes(`href="${route}"`));
  for (const label of ["BMP VISUAL", "BMP CREATOR", "BMP TECH", "Selected Work", "What BMP Does"]) assert.ok(html.includes(label));
  assert.doesNotMatch(html, /CONTINUE →|gateway-briefing|role="progressbar"/);
  assert.match(html, /BMP is a creative-tech studio/);
});

test("SEO endpoints respond and the experiment has an explicit crawlable noindex policy", async () => {
  const robots = await fetch(`${baseUrl}/robots.txt`);
  assert.equal(robots.status, 200);
  assert.match(await robots.text(), /User-Agent: \*/i);
  const sitemap = await fetch(`${baseUrl}/sitemap.xml`);
  assert.equal(sitemap.status, 200);
  assert.match(sitemap.headers.get("content-type"), /xml/);
  assert.match(await sitemap.text(), /urlset/);
});
