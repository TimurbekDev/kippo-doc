/**
 * Static prerender: after `vite build`, emit one physical HTML file per route
 * under dist/, each with route-correct <title>, meta description, canonical,
 * Open Graph tags, a per-page BreadcrumbList, and a crawlable <noscript> +
 * #root snapshot. The SPA still boots and takes over on load (createRoot
 * clears #root), so this is purely to give crawlers real per-URL HTML.
 *
 * Most static hosts (Netlify/Vercel/Cloudflare Pages/GH Pages) serve the
 * physical file before the SPA fallback, so /docs/.../overview resolves to its
 * prerendered file while client navigation still works.
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { BASE_URL, SITE_NAME, PACKAGE_ID, routes } from './seo-manifest.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const distDir = join(__dirname, '..', 'dist');
const template = readFileSync(join(distDir, 'index.html'), 'utf8');

const esc = (s) =>
  s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

function canonical(path) {
  return path === '/' ? `${BASE_URL}/` : `${BASE_URL}${path}`;
}

function breadcrumbJsonLd(route) {
  if (!route.isDoc) return '';
  const items = [
    { name: 'Home', item: `${BASE_URL}/` },
    { name: 'Docs', item: `${BASE_URL}/docs/${PACKAGE_ID}/latest/overview` },
    { name: route.heading, item: canonical(route.path) },
  ].map((it, i) => ({
    '@type': 'ListItem',
    position: i + 1,
    name: it.name,
    item: it.item,
  }));
  const json = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items,
  };
  return `\n    <script type="application/ld+json">${JSON.stringify(json)}</script>`;
}

function noscriptHtml(route) {
  const heading = esc(route.heading ?? route.title);
  return `<noscript>
      <main style="max-width:720px;margin:0 auto;padding:2rem;font-family:system-ui,sans-serif;color:#e4e4e7;background:#09090b">
        <h1>${heading}</h1>
        <p>${esc(route.description)}</p>
        <p>Kippo is a Telegram bot framework for C# and .NET. Install with <code>dotnet add package Kippo</code>.</p>
        <ul>
          <li><a href="/docs/${PACKAGE_ID}/latest/overview">Kippo documentation</a></li>
          <li><a href="https://www.nuget.org/packages/${PACKAGE_ID}/">NuGet package</a></li>
          <li><a href="https://github.com/TimurbekDev/KippoGramm">GitHub repository</a></li>
        </ul>
      </main>
    </noscript>`;
}

function rootSnapshot(route) {
  const heading = esc(route.heading ?? route.title);
  return `<div id="root"><div style="max-width:760px;margin:0 auto;padding:2rem;font-family:system-ui,sans-serif;color:#e4e4e7;background:#09090b;min-height:100vh"><h1>${heading}</h1><p>${esc(
    route.description,
  )}</p><p><a href="/docs/${PACKAGE_ID}/latest/overview" style="color:#60a5fa">Read the Kippo documentation →</a></p></div></div>`;
}

function replaceTag(html, regex, replacement) {
  if (!regex.test(html)) {
    throw new Error(`prerender: pattern not found in template: ${regex}`);
  }
  return html.replace(regex, replacement);
}

function render(route) {
  const t = esc(route.title);
  const d = esc(route.description);
  const url = canonical(route.path);
  let html = template;

  html = replaceTag(html, /<title>[\s\S]*?<\/title>/, `<title>${t}</title>`);
  html = replaceTag(
    html,
    /<meta\s+name="description"[\s\S]*?\/>/,
    `<meta name="description" content="${d}" />`,
  );
  html = replaceTag(
    html,
    /<link rel="canonical"[^>]*\/>/,
    `<link rel="canonical" href="${url}" />`,
  );
  html = replaceTag(
    html,
    /<meta property="og:url"[\s\S]*?\/>/,
    `<meta property="og:url" content="${url}" />`,
  );
  html = replaceTag(
    html,
    /<meta property="og:title"[\s\S]*?\/>/,
    `<meta property="og:title" content="${t}" />`,
  );
  html = replaceTag(
    html,
    /<meta\s+property="og:description"[\s\S]*?\/>/,
    `<meta property="og:description" content="${d}" />`,
  );
  html = replaceTag(
    html,
    /<meta name="twitter:title"[\s\S]*?\/>/,
    `<meta name="twitter:title" content="${t}" />`,
  );
  html = replaceTag(
    html,
    /<meta\s+name="twitter:description"[\s\S]*?\/>/,
    `<meta name="twitter:description" content="${d}" />`,
  );

  // Per-page breadcrumb structured data.
  html = html.replace('</head>', `${breadcrumbJsonLd(route)}\n  </head>`);

  // Crawlable fallback content.
  html = replaceTag(html, /<noscript>[\s\S]*?<\/noscript>/, noscriptHtml(route));
  html = replaceTag(html, /<div id="root"><\/div>/, rootSnapshot(route));

  return html;
}

let count = 0;
for (const route of routes()) {
  const html = render(route);
  const outPath =
    route.path === '/'
      ? join(distDir, 'index.html')
      : join(distDir, route.path.replace(/^\//, ''), 'index.html');
  mkdirSync(dirname(outPath), { recursive: true });
  writeFileSync(outPath, html, 'utf8');
  count++;
}

console.log(`prerendered ${count} routes into dist/ (SITE_NAME=${SITE_NAME})`);
