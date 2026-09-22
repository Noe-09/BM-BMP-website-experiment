import assert from "node:assert/strict";
import { spawn } from "node:child_process";
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
    [nextBin.pathname, "dev", "--webpack", "--hostname", "127.0.0.1", "--port", String(port)],
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
      const existing = startupOutput.match(/existing server at (http:\/\/[^,\s]+)/i)?.[1];
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
        finish(() => reject(new Error(`Next dev exited with ${code}: ${startupOutput}`)));
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

test("every important route carries the noindex header and no production canonical", async () => {
  for (const path of ["/", "/art", "/studio", "/work", "/contact"]) {
    const response = await fetch(`${baseUrl}${path}`);
    const html = await response.text();

    assert.equal(
      response.headers.get("x-robots-tag"),
      "noindex, nofollow",
      `${path} should carry X-Robots-Tag`,
    );
    assert.match(html, /<meta name="robots" content="noindex, nofollow"\/?>/, `${path} should carry a robots meta tag`);
    assert.doesNotMatch(
      html,
      /rel="canonical"[^>]+(vercel\.app|bm-bmp-website)/i,
      `${path} should not claim a production canonical`,
    );
  }
});

test("robots.txt disallows crawling entirely", async () => {
  const response = await fetch(`${baseUrl}/robots.txt`);
  const body = await response.text();

  assert.equal(response.status, 200);
  assert.match(body, /User-agent:\s*\*/i);
  assert.match(body, /Disallow:\s*\//);
});

test("sitemap.xml is present and does not undermine the noindex policy", async () => {
  const response = await fetch(`${baseUrl}/sitemap.xml`);
  const body = await response.text();

  assert.equal(response.status, 200);
  assert.match(body, /<urlset/);
  assert.doesNotMatch(body, /<url>/);
});
