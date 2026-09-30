// Run after npm run build. Checks Next's actual client reference manifests.
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import vm from 'node:vm';
const manifests = {};
for (const route of ['page', 'art/page']) {
  const context = vm.createContext({});
  vm.runInContext(readFileSync(`.next/server/app/${route}_client-reference-manifest.js`, 'utf8'), context);
  manifests[route] = context.__RSC_MANIFEST[`/${route}`];
}
const referenced = route => Object.entries(manifests[route].clientModules).filter(([, mod]) => mod.chunks.length > 0).map(([name]) => name);
assert.ok(!referenced('page').some(name => /[/\\](gateway|three)[/\\]/i.test(name)), 'Homepage references Gateway/Three client modules');
assert.ok(referenced('art/page').some(name => name.includes('GatewayPrototype')), 'Art must reference Gateway');
// Next lists unused modules with empty chunks; HTML records the actual script entries.
const chunks = file => new Set([...readFileSync(file, 'utf8').matchAll(/<script[^>]+src="\/_next\/([^"?]+\.js)/g)].map(match => match[1]));
const homeChunks = chunks('.next/server/app/index.html');
const artChunks = chunks('.next/server/app/art.html');
const walk = dir => readdirSync(dir).flatMap(name => { const p = `${dir}/${name}`; return statSync(p).isDirectory() ? walk(p) : [p]; });
const heavyChunks = walk('.next/static/chunks').filter(p => p.endsWith('.js') && /THREE\.|WebGLRenderer|gateway-prototype/.test(readFileSync(p, 'utf8'))).map(p => p.replace('.next/', ''));
assert.ok(heavyChunks.length > 0, 'Detection must find emitted Gateway/Three chunks');
assert.ok(heavyChunks.every(c => !homeChunks.has(c)), 'Heavy code leaked into home chunks');
console.log(JSON.stringify({ homeChunks: [...homeChunks], artOnlyChunks: [...artChunks].filter(c => !homeChunks.has(c)), heavyChunks, homeJavaScriptBytes: [...homeChunks].reduce((sum, p) => sum + statSync(`.next/${p}`).size, 0) }, null, 2));
