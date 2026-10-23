/**
 * Creates a sitemap from the routes that were actually prerendered during the
 * current build. This keeps the sitemap, HTML files, and canonical URLs in
 * lockstep even if Firestore changes while a deploy is running.
 */
import fs from 'node:fs';
import path from 'node:path';

import { BASE_URL, PUBLIC_ROUTES } from '../src/data/site-seo.js';

const DIST_DIR = path.join(process.cwd(), 'dist');
const manifestPath = path.join(DIST_DIR, 'route-manifest.json');
const today = new Date().toISOString().slice(0, 10);

function sitemapEntry(route) {
  const url = `${BASE_URL}${route === '/' ? '/' : route}`;
  const staticRoute = PUBLIC_ROUTES.find((item) => item.path === route);
  const isBlog = route.startsWith('/blog/');

  return [
    '  <url>',
    `    <loc>${url}</loc>`,
    `    <lastmod>${today}</lastmod>`,
    `    <changefreq>${staticRoute?.changefreq || (isBlog ? 'weekly' : 'monthly')}</changefreq>`,
    `    <priority>${staticRoute?.priority || (isBlog ? '0.8' : '0.7')}</priority>`,
    '  </url>',
  ].join('\n');
}

if (!fs.existsSync(manifestPath)) {
  throw new Error('dist/route-manifest.json is missing. Run the prerender step before generating the sitemap.');
}

const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
const staticPaths = new Set(PUBLIC_ROUTES.map((route) => route.path));
const routes = Object.keys(manifest)
  .filter((route) => staticPaths.has(route) || route.startsWith('/projects/') || route.startsWith('/blog/'))
  .sort((left, right) => left.localeCompare(right));

if (!routes.includes('/') || !routes.includes('/projects') || !routes.includes('/blog')) {
  throw new Error('Prerender manifest is missing one or more required public routes.');
}

const xml = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ...routes.map(sitemapEntry),
  '</urlset>',
  '',
].join('\n');

for (const destination of [path.join(DIST_DIR, 'sitemap.xml'), path.join(process.cwd(), 'public', 'sitemap.xml')]) {
  fs.writeFileSync(destination, xml, 'utf8');
}

console.log(`Sitemap generated for ${routes.length} prerendered public route(s).`);
