import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const BASE_URL = "https://jaiminumaraniya.me";
const DIST_DIR = path.join(process.cwd(), "dist");
const PUBLIC_DIR = path.join(process.cwd(), "public");

function extractAll(expression, value) {
  return [...value.matchAll(expression)].map((match) => match[1]);
}

function pageFile(route) {
  if (route === "/") return "index.html";
  return `${route.slice(1)}.html`;
}

const sitemapFile = path.join(DIST_DIR, "sitemap.xml");
assert.ok(fs.existsSync(sitemapFile), "dist/sitemap.xml was not generated.");
const sitemap = fs.readFileSync(sitemapFile, "utf8");
assert.match(sitemap, /^<\?xml version="1\.0" encoding="UTF-8"\?>/);
assert.match(sitemap, /<urlset xmlns="http:\/\/www\.sitemaps\.org\/schemas\/sitemap\/0\.9">/);
assert.match(sitemap, /<\/urlset>\s*$/);

const urls = extractAll(/<loc>([^<]+)<\/loc>/g, sitemap);
assert.ok(urls.length > 0, "Sitemap contains no URLs.");
assert.equal(new Set(urls).size, urls.length, "Sitemap contains duplicate URLs.");

const manifestFile = path.join(DIST_DIR, "route-manifest.json");
assert.ok(fs.existsSync(manifestFile), "dist/route-manifest.json was not generated.");
const manifest = JSON.parse(fs.readFileSync(manifestFile, "utf8"));
const expectedPublicRoutes = Object.keys(manifest)
  .filter((route) => ["/", "/projects", "/blog", "/contact", "/privacy-policy", "/refund-policy"].includes(route)
    || route.startsWith("/projects/")
    || route.startsWith("/blog/"));
const sitemapRoutes = urls.map((url) => url.slice(BASE_URL.length));
assert.deepEqual([...sitemapRoutes].sort(), [...expectedPublicRoutes].sort(), "Sitemap routes must exactly match the prerendered public route manifest.");

const seen = { titles: new Set(), descriptions: new Set(), canonicals: new Set() };
const routePaths = [];

for (const url of urls) {
  assert.ok(url.startsWith(`${BASE_URL}/`), `Non-production sitemap URL: ${url}`);
  assert.ok(!url.includes("?") && !url.includes("#"), `Non-canonical sitemap URL: ${url}`);

  const route = url.slice(BASE_URL.length);
  const file = path.join(DIST_DIR, pageFile(route));
  assert.ok(fs.existsSync(file), `Sitemap route has no prerendered HTML: ${route}`);

  const html = fs.readFileSync(file, "utf8");
  const titles = extractAll(/<title>([\s\S]*?)<\/title>/gi, html);
  const descriptions = extractAll(/<meta\b(?=[^>]*\bname=["']description["'])[^>]*\bcontent=["']([^"']*)["'][^>]*>/gi, html);
  const canonicals = extractAll(/<link\b(?=[^>]*\brel=["']canonical["'])[^>]*\bhref=["']([^"']+)["'][^>]*>/gi, html);
  const robots = extractAll(/<meta\b(?=[^>]*\bname=["']robots["'])[^>]*\bcontent=["']([^"']*)["'][^>]*>/gi, html);
  const headings = extractAll(/<h1\b[^>]*>([\s\S]*?)<\/h1>/gi, html);
  const jsonLd = extractAll(/<script\b(?=[^>]*\btype=["']application\/ld\+json["'])[^>]*>([\s\S]*?)<\/script>/gi, html);

  assert.equal(titles.length, 1, `${route} must have exactly one title.`);
  assert.ok(titles[0].trim(), `${route} has an empty title.`);
  assert.ok(!seen.titles.has(titles[0]), `Duplicate title: ${titles[0]}`);
  seen.titles.add(titles[0]);

  assert.equal(descriptions.length, 1, `${route} must have exactly one description.`);
  assert.ok(descriptions[0].trim().length >= 40, `${route} has an empty or very short description.`);
  assert.ok(!seen.descriptions.has(descriptions[0]), `Duplicate description on ${route}.`);
  seen.descriptions.add(descriptions[0]);

  assert.equal(canonicals.length, 1, `${route} must have exactly one canonical.`);
  assert.equal(canonicals[0], url, `${route} canonical does not match sitemap URL.`);
  assert.ok(!seen.canonicals.has(canonicals[0]), `Duplicate canonical: ${canonicals[0]}`);
  seen.canonicals.add(canonicals[0]);

  assert.equal(robots.length, 1, `${route} must have exactly one robots directive.`);
  assert.doesNotMatch(robots[0], /noindex/i, `${route} is unexpectedly noindex.`);
  assert.equal(headings.length, 1, `${route} must have exactly one H1.`);
  assert.ok(headings[0].replace(/<[^>]*>/g, "").trim(), `${route} has an empty H1.`);
  assert.ok(jsonLd.length > 0, `${route} has no structured data.`);
  for (const json of jsonLd) assert.doesNotThrow(() => JSON.parse(json), `${route} has invalid JSON-LD.`);
  assert.match(html, /<main\b[^>]*id="seo-prerender"/, `${route} has no prerendered main content.`);

  if (route.startsWith("/projects/") || route.startsWith("/blog/")) {
    assert.match(html, /aria-label="Breadcrumb"/, `${route} is missing visible breadcrumbs.`);
  }
  routePaths.push(route);
}

assert.ok(routePaths.includes("/"), "Homepage is missing from sitemap.");
assert.ok(routePaths.includes("/projects"), "Projects listing is missing from sitemap.");
assert.ok(routePaths.includes("/blog"), "Blog listing is missing from sitemap.");

for (const [route, indexRoute] of [
  ["/projects", "/projects"],
  ["/blog", "/blog"],
]) {
  const html = fs.readFileSync(path.join(DIST_DIR, pageFile(route)), "utf8");
  const detailRoutes = routePaths.filter((item) => item.startsWith(`${indexRoute}/`));
  for (const detail of detailRoutes) {
    assert.match(html, new RegExp(`href="${detail.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}"`), `${detail} is not linked from ${route}.`);
  }
}

for (const privateFile of ["app-shell.html", "admin.html", "admin-login.html", "login.html", "style-guide.html", "seed.html", "404.html"]) {
  assert.ok(fs.existsSync(path.join(DIST_DIR, privateFile)), `${privateFile} was not generated.`);
  const html = fs.readFileSync(path.join(DIST_DIR, privateFile), "utf8");
  assert.match(html, /<meta\b(?=[^>]*\bname=["']robots["'])(?=[^>]*\bcontent=["']noindex,nofollow["'])[^>]*>/i, `${privateFile} must be noindex.`);
  assert.doesNotMatch(html, /<link\b(?=[^>]*\brel=["']canonical["'])[^>]*>/i, `${privateFile} must not have a canonical.`);
}

const redirects = fs.readFileSync(path.join(PUBLIC_DIR, "_redirects"), "utf8");
assert.match(redirects, /^\/projects\/\*\s+\/\S+\s+404$/m, "Missing real 404 handling for unknown project paths.");
assert.match(redirects, /^\/blog\/\*\s+\/\S+\s+404$/m, "Missing real 404 handling for unknown blog paths.");

const robots = fs.readFileSync(path.join(PUBLIC_DIR, "robots.txt"), "utf8");
assert.match(robots, /Sitemap:\s+https:\/\/jaiminumaraniya\.me\/sitemap\.xml/i);
assert.doesNotMatch(robots, /Disallow:\s*\/(?:assets|static|projects|blog)/i);

console.log(`SEO validation passed for ${urls.length} sitemap URLs and ${routePaths.filter((route) => route.startsWith("/projects/")).length} projects / ${routePaths.filter((route) => route.startsWith("/blog/")).length} articles.`);
