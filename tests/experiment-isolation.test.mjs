import assert from 'node:assert/strict';
import test from 'node:test';
import { assertIsolation } from '../scripts/verify-isolation.mjs';

const sha = 'fd66811f7fb96c0a733ec8b1915d305af6db50ae';

const base = {
  originalRepo: 'Noe-09/BM-BMP-website',
  experimentRepo: 'Noe-09/BM-BMP-website-experiment',
  originalProjectId: 'prj_v1',
  experimentProjectId: 'prj_new',
  sourceSha: sha,
};

test('accepts a properly isolated configuration', () => {
  assert.equal(assertIsolation(base), true);
});

test('rejects deployment into original Vercel project', () => {
  assert.throws(
    () => assertIsolation({ ...base, experimentProjectId: 'prj_v1' }),
    /same project/i,
  );
});

test('rejects repository aliasing', () => {
  assert.throws(
    () => assertIsolation({ ...base, experimentRepo: 'Noe-09/BM-BMP-website' }),
    /same repository/i,
  );
});

test('rejects a missing field', () => {
  assert.throws(
    () => assertIsolation({ ...base, experimentProjectId: '' }),
    /missing experimentProjectId/i,
  );
});

test('rejects a source SHA that does not match the approved commit', () => {
  assert.throws(
    () => assertIsolation({ ...base, sourceSha: 'deadbeef' }),
    /source sha mismatch/i,
  );
});
