/**
 * Generates public/sitemap.xml from the shared SEO manifest.
 * Run via `npm run gen:sitemap` (also invoked by `prebuild`).
 */
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { BASE_URL, routes } from './seo-manifest.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const outFile = join(__dirname, '..', 'public', 'sitemap.xml');

const lastmod = new Date().toISOString().slice(0, 10);

const urls = routes()
  .map(
    (r) => `  <url>
    <loc>${BASE_URL}${r.path === '/' ? '/' : r.path}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${r.changefreq}</changefreq>
    <priority>${r.priority}</priority>
  </url>`,
  )
  .join('\n');

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;

writeFileSync(outFile, xml, 'utf8');
console.log(`sitemap.xml written with ${routes().length} URLs`);
