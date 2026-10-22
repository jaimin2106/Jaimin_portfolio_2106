/**
 * Build-time sitemap generator.
 *
 * Uses the shared route registry (`src/data/site-seo.js`) so the sitemap can
 * never drift away from the canonical URLs or from the routes that are
 * actually prerendered.
 *
 * Included:  public indexable routes + published projects + published blog posts.
 * Excluded:  admin / authentication / tooling routes, unpublished content and
 *            any URL that is not a real route.
 */

import fs from 'fs';
import path from 'path';
import { initializeApp } from 'firebase/app';
import { collection, getDocs, initializeFirestore } from 'firebase/firestore';

import { BASE_URL, PUBLIC_ROUTES } from '../src/data/site-seo.js';

const firebaseConfig = {
  projectId: "astute-abbey-p1wkv",
  appId: "1:509171019192:web:4aba69e3e6ad580df2334d",
  apiKey: "AIzaSyAPch8N_4oxiFv8iKhIJ2zTVgbTGt32nHI",
  authDomain: "astute-abbey-p1wkv.firebaseapp.com",
  storageBucket: "astute-abbey-p1wkv.firebasestorage.app",
  messagingSenderId: "509171019192"
};

const app = initializeApp(firebaseConfig);
// No persistent cache — this runs in Node.js during build, not a browser
const db = initializeFirestore(app, {}, "ai-studio-72db9056-9c78-47ef-8e14-18be539b546c");

const ORIGIN = BASE_URL;

/** Canonical, absolute URL for a route path (no trailing slash, root keeps "/"). */
function loc(routePath) {
  return ORIGIN + (routePath === '/' ? '/' : routePath);
}

async function generateSitemap() {
  console.log("Generating dynamic sitemap...");
  const today = new Date().toISOString().split('T')[0];

  // Static routes come from the shared registry, so they always match the
  // prerendered pages and their canonical URLs exactly.
  const routes = PUBLIC_ROUTES.map((route) => ({
    url: route.path,
    changefreq: route.changefreq,
    priority: route.priority,
    lastmod: today,
  }));

  let projectCount = 0;
  let blogCount = 0;

  try {
    // ── Projects ───────────────────────────────────────────────────────────
    console.log("Fetching projects from Firestore...");
    const projectsSnapshot = await getDocs(collection(db, 'projects'));
    projectsSnapshot.forEach((doc) => {
      const data = doc.data();
      // Skip unpublished / draft projects
      if (data.status && data.status !== 'Published') return;
      // Route identity is the slug, exactly like the internal links and the
      // prerendered /projects/<slug>.html file.
      const slug = String(data.slug || doc.id).toLowerCase();
      if (!slug) return;
      const lastmod = data.updatedAt?.toDate?.()?.toISOString().split('T')[0] || today;
      routes.push({ url: `/projects/${slug}`, changefreq: 'monthly', priority: '0.7', lastmod });
      projectCount++;
    });

    // ── Blog posts ─────────────────────────────────────────────────────────
    console.log("Fetching blog posts from Firestore...");
    const blogsSnapshot = await getDocs(collection(db, 'blogs'));
    blogsSnapshot.forEach((doc) => {
      const data = doc.data();
      // Only include published posts
      if (data.status !== 'Published') return;
      const slug = String(data.slug || doc.id).toLowerCase();
      if (!slug) return;
      const lastmod = data.updatedAt?.toDate?.()?.toISOString().split('T')[0] || today;
      routes.push({ url: `/blog/${slug}`, changefreq: 'weekly', priority: '0.8', lastmod });
      blogCount++;
    });
  } catch (e) {
    console.error("Error fetching Firestore data:", e.message);
    console.log("Proceeding with static-only sitemap.");
  }

  // Build XML — no leading whitespace on the opening tag (required for valid XML)
  const xml = [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
    ...routes.map((r) => [
      `  <url>`,
      `    <loc>${loc(r.url)}</loc>`,
      `    <lastmod>${r.lastmod}</lastmod>`,
      `    <changefreq>${r.changefreq}</changefreq>`,
      `    <priority>${r.priority}</priority>`,
      `  </url>`,
    ].join('\n')),
    `</urlset>`,
  ].join('\n');

  const outPath = path.join(process.cwd(), 'public', 'sitemap.xml');
  fs.writeFileSync(outPath, xml, 'utf-8');

  console.log(`✓ sitemap.xml written → ${outPath}`);
  console.log(`  Static pages : ${routes.length - projectCount - blogCount}`);
  console.log(`  Projects     : ${projectCount}`);
  console.log(`  Blog posts   : ${blogCount}`);
  console.log(`  Total URLs   : ${routes.length}`);

  process.exit(0);
}

generateSitemap();
