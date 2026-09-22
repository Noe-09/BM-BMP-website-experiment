const approvedSha = 'fd66811f7fb96c0a733ec8b1915d305af6db50ae';

export function assertIsolation(input) {
  const fields = [
    'originalRepo',
    'experimentRepo',
    'originalProjectId',
    'experimentProjectId',
    'sourceSha',
  ];
  for (const field of fields) {
    if (typeof input[field] !== 'string' || !input[field].trim()) {
      throw new Error(`missing ${field}`);
    }
  }

  const normalize = (name) => name.trim().replace(/\.git$/, '').toLowerCase();

  if (normalize(input.originalRepo) === normalize(input.experimentRepo)) {
    throw new Error('same repository: original and experiment repos must differ');
  }
  if (input.originalProjectId === input.experimentProjectId) {
    throw new Error('same project: original and experiment Vercel project IDs must differ');
  }
  if (input.sourceSha !== approvedSha) {
    throw new Error('source sha mismatch: sourceSha does not match the approved commit');
  }

  return true;
}
