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

async function getPage(path) {
  const response = await fetch(`${baseUrl}${path}`);
  assert.equal(response.status, 200, `${path} should render`);
  return response.text();
}

test("BM Visual and BM Tech publish every canonical service group and CTA", async () => {
  const pages = [
    {
      path: "/bm-visual",
      copy: [
        "Make the brand worth noticing.",
        "BM Visual helps businesses turn scattered, inconsistent, or forgettable digital presence into a clearer visual system that earns attention and feels more credible.",
        "Brand identity &amp; visual direction",
        "Website visual presentation / landing page creative direction",
        "Social media visual systems &amp; content assets",
        "Marketing creatives / campaign visuals",
        "AI-assisted visual production &amp; concept development",
        "Logo motion, intro/outro and lightweight motion assets",
        "Improve your visual presence",
      ],
    },
    {
      path: "/bm-tech",
      copy: [
        "Build systems around real problems.",
        "BM Tech helps lean businesses replace repetitive work, disconnected information, and manual processes with practical digital systems and lightweight tools.",
        "Business websites &amp; focused web systems",
        "Workflow automation and integrations",
        "AI-assisted internal tools and customer-facing utilities",
        "Chat / support / lead-handling systems",
        "CRM-lite and operational dashboards",
        "Custom MVPs and practical digital prototypes",
        "Tell us the problem",
      ],
    },
  ];

  for (const page of pages) {
    const html = await getPage(page.path);
    for (const value of page.copy) assert.ok(html.includes(value), value);
    assert.match(html, /href="\/contact"/);
  }
});

test("BM Visual renders the flagship experience inside the BMP architecture", async () => {
  const html = await getPage("/bm-visual");

  for (const section of [
    "hero",
    "selected-work",
    "capabilities",
    "studio",
    "closing",
  ]) {
    assert.ok(
      html.includes(`data-bm-visual-section="${section}"`),
      `BM Visual should render its ${section} flagship region`,
    );
  }

  for (const destination of [
    'href="/art"',
    'href="/studio"',
    'href="/work"',
    'href="/bm-tech"',
    'href="/creator"',
    'href="/about"',
    'href="/contact"',
  ]) {
    assert.ok(html.includes(destination), `BM Visual should retain ${destination}`);
  }

  for (const slug of ["fabriclism", "aurelia-skin", "haven", "aether"]) {
    assert.ok(
      html.includes(`href="/work/${slug}"`),
      `BM Visual should reuse the shared ${slug} case study`,
    );
  }

  assert.ok(html.includes("Make the brand worth noticing."));
  assert.ok(html.includes("Improve your visual presence"));
  assert.doesNotMatch(html, /data-bm-visual-layout="service-only"/);
});

test("About publishes the canonical story, process, and team position", async () => {
  const html = await getPage("/about");
  const exactCopy = [
    "We are building the kind of studio we would want to work with.",
    "BMP started from a simple belief: good ideas are not enough.",
    "Design makes ideas understood. Technology makes them useful. Distribution makes them matter.",
    "Understand",
    "Start with the problem, audience, context, and desired outcome.",
    "Define",
    "Build",
    "Review",
    "Improve",
    "BMP is a lean studio built around hands-on execution.",
  ];
  for (const value of exactCopy) assert.ok(html.includes(value), value);
});

test("Creator renders the approved six-world exhibition arc", async () => {
  const html = await getPage("/creator");
  const arrivalStart = html.indexOf('<section class="creator-arrival"');
  const arrivalEnd = html.indexOf("</section>", arrivalStart);
  const arrival = html.slice(arrivalStart, arrivalEnd);

  assert.equal(html.match(/<h1\b/g)?.length, 1);
  assert.ok(html.includes("THINGS"));
  assert.ok(html.includes("WE DECIDED"));
  assert.ok(html.includes("SHOULD EXIST."));
  assert.ok(arrival.includes('data-creator-arrival-artifact="neutral-threshold"'));
  assert.ok(arrival.includes('aria-hidden="true"'));
  assert.ok(arrival.includes('href="#creator-world-weins"'));
  assert.doesNotMatch(arrival, /<img\b|\/creator\/(?:weins|slyour|the-xide)\//);
  assert.match(html, /data-creator-products="6"/);
  assert.match(html, /data-creator-threshold="unrevealed"/);
  assert.ok(html.includes("THE UNREVEALED"));
  assert.ok(html.includes("Still being made inside BMP."));

  const expectedOrder = [
    "weins",
    "slyour",
    "the-xide",
    "pawsona",
    "relationship",
    "miner",
  ];
  let cursor = -1;
  for (const slug of expectedOrder) {
    const position = html.indexOf(`data-creator-world="${slug}"`, cursor + 1);
    assert.ok(position > cursor, `${slug} should follow the prior world`);
    cursor = position;
  }

  assert.match(html, /data-creator-index="worlds"/);
  assert.match(html, /data-creator-colophon="08"/);
});

test("Contact publishes canonical fields through a functional submission boundary", async () => {
  const html = await getPage("/contact");
  const exactCopy = [
    "Have a problem worth solving?",
    "Tell us what you are trying to improve, build, or simplify. We will look at the problem first and recommend a focused direction before expanding the scope.",
    "Name",
    "Business / brand",
    "Email / contact",
    "What are you trying to improve or build?",
    "Current website / social / reference link",
    "Budget range",
    "Preferred timeline",
    "Start a project",
    "View our work",
  ];
  for (const value of exactCopy) assert.ok(html.includes(value), value);
  assert.match(html, /<form[^>]+action=/);
  assert.doesNotMatch(html, /<button[^>]*disabled[^>]*>Start a project<\/button>/);
  assert.match(html, /<input[^>]+type="email"[^>]+name="contact"/);
  assert.match(html, /<input[^>]+type="url"[^>]+name="reference"/);
  assert.ok(html.includes("Required"));
  assert.ok(html.includes("Optional"));
  assert.ok(html.includes("Project inquiry status"));
  assert.match(html, /href="https:\/\/zalo\.me\/0326034128"/);
  assert.match(html, /href="\/work"/);
});
