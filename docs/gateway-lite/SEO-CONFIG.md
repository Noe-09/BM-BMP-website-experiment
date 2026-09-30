# Experiment SEO policy

No production origin has been confirmed. Defaults are deliberately:

- `noindex, follow` on public experiment pages; crawling allowed in robots.txt so that directive can be read.
- No canonical URL, metadataBase, OG URL or invented absolute image URL.
- `/sitemap.xml` returns a valid empty URL set until the confirmed origin is configured.

After the real origin is confirmed, set `BMP_CONFIRMED_ORIGIN` to its HTTPS origin (no path, credentials, query or fragment), then rebuild. This enables absolute canonical/OG URLs and sitemap entries for existing public pages and verified published detail records. No fabricated last-modified dates or priorities are added. Project Open Graph imagery uses the existing verified project asset.

`BMP_ALLOW_INDEXING=true` is a separate explicit opt-in, effective only with a valid confirmed origin. Do not enable it for an experiment preview. Production routing, domains and deployments are not modified by this branch.

The legacy prototype still redirects to `/` with 307; invalid routes/slugs and the development-only review endpoint retain real production 404 responses.
