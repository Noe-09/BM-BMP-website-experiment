# Experiment Provenance

Recorded 2026-09-22, resuming a handoff from a prior implementation pass.

## Source

- `originalRepo`: `Noe-09/BM-BMP-website`
- `sourceSha` (approved): `fd66811f7fb96c0a733ec8b1915d305af6db50ae`
- Verified via `git ls-remote https://github.com/Noe-09/BM-BMP-website.git HEAD` on 2026-09-22 →
  `fd66811f7fb96c0a733ec8b1915d305af6db50ae` (matches approved SHA; `main` unchanged since approval).
- Original repo remains **read-only** for this work. It is kept in this local clone as the
  git remote named `upstream`; nothing is ever pushed to it.

## Experiment target

- `experimentRepo`: `Noe-09/BM-BMP-website-experiment` (already exists, private, created by a
  prior session; not recreated here).
- Verified via `git ls-remote https://github.com/Noe-09/BM-BMP-website-experiment.git HEAD` on
  2026-09-22 → `fd66811f7fb96c0a733ec8b1915d305af6db50ae` (`main` already matches the approved
  source SHA — the repo is presently a copy of V1, consistent with the handoff notes).
- Local working clone: fresh `git clone` of the original repo into a new directory
  (`~/Documents/GitHub/BM-BMP-website-experiment`), checked out at the approved SHA with
  `git switch -C main fd66811f7fb96c0a733ec8b1915d305af6db50ae`, then remotes reconfigured:
  - `origin` → `https://github.com/Noe-09/BM-BMP-website-experiment.git`
  - `upstream` → `https://github.com/Noe-09/BM-BMP-website.git` (read-only reference only)
- Secret/asset audit at checkout: `git ls-files` contains no `.env*`, `.vercel`, or credential-
  named files; `.gitignore` already excludes `.env`, `.env.local`, `.env.*.local`, and `.vercel/`.
  `git-lfs` is not installed in this environment, so no LFS pointer audit was performed; no
  `.gitattributes` LFS rules were found in a plain-text scan of the tree.

## Isolation assertion

- `scripts/verify-isolation.mjs` exports `assertIsolation({originalRepo, experimentRepo,
  originalProjectId, experimentProjectId, sourceSha})`, throwing on a matching repo name,
  a matching project ID, a missing field, or a `sourceSha` that does not equal the approved
  commit. Covered by `tests/experiment-isolation.test.mjs` (RED confirmed before
  implementation, GREEN after).
- Repo-level isolation (`originalRepo` vs `experimentRepo`, `sourceSha`) is independently
  verified above via `git ls-remote` against both remotes.

## Vercel project isolation — BLOCKED, not yet verified

This execution environment has no Vercel CLI, no Vercel API token, and no authenticated
Vercel session available to this session. `originalProjectId` and `experimentProjectId`
could **not** be looked up or verified, and are therefore intentionally left unset rather
than guessed or fabricated.

Per the approved plan ("If Vercel project cannot be created independently, stop at
source-only stage; do not use ambiguous deploy operations") and the task authorization
("If a safe Preview deployment is not possible, complete the isolated repository work and
stop before deploying"), all Vercel-related steps (Task 1 Step 6's project creation, Task 7's
Preview deployment) are stopped here pending owner action. **No Vercel deployment, project
creation, or configuration has been attempted or performed by this session.**

Owner action needed before deployment can proceed safely:
1. Confirm whether a Vercel project named `bmp-website-experiment` already exists and, if so,
   its project ID.
2. If it does not exist, create it (or authorize this session to do so with working
   credentials) as an explicit, non-auto-deploying project **not** linked to production/main
   auto-deploys, pointed at `Noe-09/BM-BMP-website-experiment`.
3. Provide (or authorize retrieval of) the original `bm-bmp-website` Vercel project ID so
   `assertIsolation` can be run with real values before any deploy.

## Deployment policy

- `deploymentPolicy`: preview-only, no custom domain, no production promotion, indexing
  blocked by default (see Task 6 work). Not yet deployed anywhere as of this record.

## Status

- G1 (isolation, repo/target IDs): **partially complete**. Repository-level isolation is
  verified; Vercel project-level isolation is blocked on owner input (see above). Proceeding
  with repository work (Tasks 2–6) per the plan's dependency graph, which does not require a
  live Vercel project. Stopping before any deployment step (Task 7) until the above is
  resolved.
