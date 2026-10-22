/**
 * Build-time prerenderer.
 *
 * Every public, indexable route is rendered to its own HTML file in `dist/`
 * so that the production HTML served by the CDN (Netlify) or by the Express
 * server contains EXACTLY ONE absolute, self-referencing canonical URL plus a
 * matching title / description / Open Graph / Twitter / JSON-LD block.
 *
 * Route identity is always the CONTENT SLUG (`slug || id`) — the same value the
 * React app uses for internal links — never the raw Firestore document id.
 */

import fs from 'fs';
import path from 'path';
import { initializeApp } from 'firebase/app';
import { collection, getDocs, initializeFirestore } from 'firebase/firestore';

import {
  APP_SHELL_FILE,
  CANONICAL_ORIGIN,
  DEFAULT_KEYWORDS,
  NOT_FOUND_FILE,
  PRIVATE_ROUTES,
  PUBLIC_ROUTES,
  ROBOTS_INDEX,
  ROBOTS_NOINDEX,
  SITE_NAME,
  absoluteUrl,
  buildHeadBlock,
  buildSchemaGraph,
  canonicalUrl,
  escapeHtml,
  replaceSeoBlock,
} from '../src/data/site-seo.js';

const firebaseConfig = {
  projectId: "astute-abbey-p1wkv",
  appId: "1:509171019192:web:4aba69e3e6ad580df2334d",
  apiKey: "AIzaSyAPch8N_4oxiFv8iKhIJ2zTVgbTGt32nHI",
  authDomain: "astute-abbey-p1wkv.firebaseapp.com",
  storageBucket: "astute-abbey-p1wkv.firebasestorage.app",
  messagingSenderId: "509171019192"
};

const app = initializeApp(firebaseConfig);
const db = initializeFirestore(app, {}, "ai-studio-72db9056-9c78-47ef-8e14-18be539b546c");

const BASE_URL = CANONICAL_ORIGIN;
const DIST_DIR = path.join(process.cwd(), 'dist');
const OG_IMAGES_DIR = path.join(DIST_DIR, 'og-images');
const FALLBACK_OG_IMAGE = absoluteUrl('/OG.jpg');

// ─── Image helpers ────────────────────────────────────────────────────────────

/**
 * If `dataUri` is a base64 data URI, writes the decoded bytes to `filePath`
 * and returns true. Otherwise returns false.
 */
function extractBase64ToFile(dataUri, filePath) {
  if (!dataUri || typeof dataUri !== 'string') return false;
  const match = dataUri.match(/^data:([a-zA-Z0-9+/]+\/[a-zA-Z0-9+/]+);base64,(.+)$/s);
  if (!match) return false;
  try {
    fs.writeFileSync(filePath, Buffer.from(match[2], 'base64'));
    return true;
  } catch {
    return false;
  }
}

/**
 * For a given list of candidate image values, returns a crawlable HTTPS URL:
 *  - If already an http(s) URL: use it directly.
 *  - If a base64 data URI: save it to dist/og-images/ and return the HTTPS URL.
 *  - Otherwise: return null (caller should use FALLBACK_OG_IMAGE).
 */
function resolveOgImage(candidates, fileName) {
  for (const img of candidates) {
    if (!img || typeof img !== 'string') continue;

    if (img.startsWith('https://') || img.startsWith('http://')) {
      return img;
    }

    if (img.startsWith('data:')) {
      const filePath = path.join(OG_IMAGES_DIR, fileName);
      if (extractBase64ToFile(img, filePath)) {
        return `${BASE_URL}/og-images/${fileName}`;
      }
    }
  }
  return FALLBACK_OG_IMAGE;
}

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function writeFile(relativePath, contents) {
  const target = path.join(DIST_DIR, relativePath);
  ensureDir(path.dirname(target));
  fs.writeFileSync(target, contents, 'utf-8');
}

/**
 * Injects crawler-visible semantic content into the React root.
 * React clears the container on hydration, so this content is only ever
 * visible to crawlers that do not execute JavaScript.
 */
function injectContent(html, { h1, description, content, breadcrumbs }) {
  if (!h1 && !content) return html;

  const crumbHtml = breadcrumbs && breadcrumbs.length > 1
    ? `<nav aria-label="Breadcrumb"><ol>${breadcrumbs
        .map((crumb, index) =>
          index === breadcrumbs.length - 1
            ? `<li><span aria-current="page">${escapeHtml(crumb.label)}</span></li>`
            : `<li><a href="${crumb.href}">${escapeHtml(crumb.label)}</a> &gt; </li>`
        )
        .join('')}</ol></nav>`
    : '';

  const h1Html = h1 ? `<h1>${escapeHtml(h1)}</h1>` : '';
  const descHtml = description ? `<p class="prerender-desc">${escapeHtml(description)}</p>` : '';
  const extraHtml = content ? `<div class="prerender-content">${content}</div>` : '';

  const payload = `<main id="seo-prerender" style="padding:2rem;max-width:800px;margin:0 auto;font-family:sans-serif;position:relative;">${crumbHtml}${h1Html}${descHtml}${extraHtml}</main>`;

  return html.replace('<div id="root"></div>', `<div id="root">${payload}</div>`);
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function runPrerender() {
  console.log('Starting Build-Time Prerendering for SEO...');

  if (!fs.existsSync(DIST_DIR)) {
    console.error("Error: dist directory not found. Run 'vite build' first.");
    process.exit(1);
  }

  ensureDir(OG_IMAGES_DIR);

  // Read the pristine Vite output. It is never mutated, every route is
  // rendered from this exact template.
  const baseHtml = fs.readFileSync(path.join(DIST_DIR, 'index.html'), 'utf-8');

  try {
    // 1. Fetch Global Settings
    console.log('Fetching global settings...');
    const { doc, getDoc } = await import('firebase/firestore');
    const settingsDoc = await getDoc(doc(db, 'settings', 'global'));
    const settings = settingsDoc.data() || {};

    const globalOgImage = settings.ogImage ? absoluteUrl(settings.ogImage) : FALLBACK_OG_IMAGE;
    const settingsKeywords = settings.seoKeywords
      ? String(settings.seoKeywords).split(',').map((k) => k.trim()).filter(Boolean)
      : DEFAULT_KEYWORDS;

    // 2. Fetch Projects
    console.log('Fetching projects...');
    const projectsSnap = await getDocs(collection(db, 'projects'));
    const projects = [];
    projectsSnap.forEach((d) => {
      const data = d.data();
      if (data.status === 'Published') projects.push({ id: d.id, ...data });
    });

    // 3. Fetch Blogs
    console.log('Fetching blogs...');
    const blogsSnap = await getDocs(collection(db, 'blogs'));
    const blogs = [];
    blogsSnap.forEach((d) => {
      const data = d.data();
      if (data.status === 'Published') blogs.push({ id: d.id, ...data });
    });

    // ── VALIDATION PHASE ───────────────────────────────────────────────────
    console.log('Validating SEO requirements...');
    const slugMap = new Set();
    let hasErrors = false;

    for (const blog of blogs) {
      const slug = (blog.slug || blog.id).toLowerCase();
      if (slugMap.has(slug)) {
        console.error(`[SEO VALIDATION ERROR] Duplicate blog slug detected: ${slug}`);
        hasErrors = true;
      }
      slugMap.add(slug);
      if (!blog.title || blog.title.length < 5) {
        console.warn(`[SEO WARNING] Blog "${slug}" has very short or missing title.`);
      }
      if (!blog.seoDescription && !blog.shortDescription && !blog.excerpt) {
        console.warn(`[SEO WARNING] Blog "${slug}" is missing a description.`);
      }
    }

    for (const project of projects) {
      const slug = (project.slug || project.id).toLowerCase();
      if (slugMap.has(slug)) {
        console.error(`[SEO VALIDATION ERROR] Duplicate project slug detected: ${slug}`);
        hasErrors = true;
      }
      slugMap.add(slug);
      if (!project.title) {
        console.warn(`[SEO WARNING] Project "${slug}" is missing a title.`);
      }
      if (!project.seoDescription && !project.shortDescription && !project.subtitle) {
        console.warn(`[SEO WARNING] Project "${slug}" is missing a description.`);
      }
    }

    if (hasErrors) {
      console.warn('Validation had errors but continuing prerender for valid pages.');
    }

    // Route manifest: request path -> prerendered file inside dist/.
    const manifest = {};

    // ── APP SHELL ──────────────────────────────────────────────────────────
    // Served for any route that is not prerendered (unknown paths, deep admin
    // routes). It is `noindex` and carries NO canonical so it can never be
    // mistaken for the homepage or for any other page.
    const shellBlock = buildHeadBlock({
      title: `${SITE_NAME} | Full-Stack Developer & AI Engineer`,
      description:
        'Jaimin Umaraniya is a Full-Stack Developer and AI Engineer specializing in React, Next.js, Node.js, AI-powered applications, SaaS architecture, technical SEO, and high-performance web experiences.',
      keywords: null,
      canonical: null,
      robots: ROBOTS_NOINDEX,
      schema: null,
    });
    writeFile(APP_SHELL_FILE, replaceSeoBlock(baseHtml, shellBlock));
    console.log(`✓ Prerendered ${APP_SHELL_FILE} (noindex shell)`);

    // ── 404 ────────────────────────────────────────────────────────────────
    const notFoundBlock = buildHeadBlock({
      title: `Page not found | ${SITE_NAME}`,
      description: 'The page you are looking for does not exist.',
      keywords: null,
      canonical: null,
      robots: ROBOTS_NOINDEX,
      schema: null,
    });
    writeFile(NOT_FOUND_FILE, replaceSeoBlock(baseHtml, notFoundBlock));
    console.log(`✓ Prerendered ${NOT_FOUND_FILE} (noindex)`);

    // ── PUBLIC STATIC ROUTES ───────────────────────────────────────────────
    for (const route of PUBLIC_ROUTES) {
      const canonical = canonicalUrl(route.path);
      const breadcrumbs =
        route.path === '/'
          ? [{ label: route.h1, href: canonical }]
          : [
              { label: 'Home', href: `${BASE_URL}/` },
              { label: route.h1, href: canonical },
            ];

      const headBlock = buildHeadBlock({
        title: route.title,
        description: route.description,
        keywords: route.keywords || settingsKeywords,
        canonical,
        ogImage: globalOgImage,
        ogImageAlt: route.title,
        type: 'website',
        robots: ROBOTS_INDEX,
        schema: buildSchemaGraph({
          title: route.title,
          description: route.description,
          canonical,
          schemaType: route.schemaType,
          image: globalOgImage,
          breadcrumbs,
        }),
      });

      const html = injectContent(replaceSeoBlock(baseHtml, headBlock), {
        h1: route.h1,
        description: route.description,
        breadcrumbs,
      });

      writeFile(route.file, html);
      manifest[route.path] = route.file;
      console.log(`✓ Prerendered ${route.path} → dist/${route.file} (canonical ${canonical})`);
    }

    // ── PRIVATE ROUTES (admin / auth / tooling) ────────────────────────────
    for (const route of PRIVATE_ROUTES) {
      const headBlock = buildHeadBlock({
        title: route.title,
        description: 'Private area. Not available for indexing.',
        keywords: null,
        canonical: null,
        robots: ROBOTS_NOINDEX,
        schema: null,
      });
      writeFile(route.file, replaceSeoBlock(baseHtml, headBlock));
      manifest[route.path] = route.file;
      console.log(`✓ Prerendered ${route.path} → dist/${route.file} (noindex)`);
    }

    // ── INDIVIDUAL PROJECTS (/projects/:slug) ──────────────────────────────
    for (const project of projects) {
      const slug = String(project.slug || project.id).toLowerCase();
      const routePath = `/projects/${slug}`;
      const canonical = canonicalUrl(routePath);

      const pTitle = `${project.title} | Case Study`;
      const pDesc =
        project.seoDescription ||
        project.shortDescription ||
        project.subtitle ||
        project.description ||
        '';

      const pImage = resolveOgImage(
        [project.seoImage, project.ogImage, project.thumbnail, project.featuredImage, project.image],
        `project-${slug}.jpg`
      );

      const breadcrumbs = [
        { label: 'Home', href: `${BASE_URL}/` },
        { label: 'Projects', href: `${BASE_URL}/projects` },
        { label: project.title, href: canonical },
      ];

      const headBlock = buildHeadBlock({
        title: pTitle,
        description: pDesc,
        keywords: project.seoKeywords
          ? String(project.seoKeywords).split(',').map((k) => k.trim()).filter(Boolean)
          : project.techStack,
        canonical,
        ogImage: pImage,
        ogImageAlt: project.title,
        type: 'article',
        robots: ROBOTS_INDEX,
        schema: buildSchemaGraph({
          title: pTitle,
          description: pDesc,
          canonical,
          schemaType: 'SoftwareApplication',
          image: pImage,
          breadcrumbs,
          extra: {
            '@type': 'SoftwareApplication',
            '@id': `${canonical}#software`,
            name: project.title,
            headline: project.title,
            description: pDesc,
            image: pImage,
            applicationCategory: project.category || 'WebApplication',
            author: { '@id': `${BASE_URL}/#person` },
            url: canonical,
          },
        }),
      });

      const html = injectContent(replaceSeoBlock(baseHtml, headBlock), {
        h1: project.title,
        description: pDesc,
        breadcrumbs,
      });

      writeFile(path.join('projects', `${slug}.html`), html);
      manifest[routePath] = path.join('projects', `${slug}.html`);
      console.log(`  ✓ Prerendered ${routePath} (canonical ${canonical})`);
    }

    // ── INDIVIDUAL BLOGS (/blog/:slug) ─────────────────────────────────────
    for (const blog of blogs) {
      const slug = String(blog.slug || blog.id).toLowerCase();
      const routePath = `/blog/${slug}`;
      const canonical = canonicalUrl(routePath);

      const bTitle = `${blog.title} | Technical Blog`;
      const bDesc = blog.seoDescription || blog.excerpt || blog.shortDescription || '';

      const bImage = resolveOgImage([blog.seoImage, blog.ogImage, blog.image], `blog-${slug}.jpg`);

      const breadcrumbs = [
        { label: 'Home', href: `${BASE_URL}/` },
        { label: 'Blog', href: `${BASE_URL}/blog` },
        { label: blog.title, href: canonical },
      ];

      const headBlock = buildHeadBlock({
        title: bTitle,
        description: bDesc,
        keywords: blog.seoKeywords
          ? String(blog.seoKeywords).split(',').map((k) => k.trim()).filter(Boolean)
          : blog.tags,
        canonical,
        ogImage: bImage,
        ogImageAlt: blog.title,
        type: 'article',
        robots: ROBOTS_INDEX,
        schema: buildSchemaGraph({
          title: bTitle,
          description: bDesc,
          canonical,
          schemaType: 'BlogPosting',
          image: bImage,
          breadcrumbs,
          extra: {
            '@type': 'BlogPosting',
            '@id': `${canonical}#article`,
            headline: blog.title,
            description: bDesc,
            image: bImage,
            author: { '@id': `${BASE_URL}/#person` },
            datePublished: blog.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
            dateModified: blog.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
            mainEntityOfPage: { '@type': 'WebPage', '@id': canonical },
            url: canonical,
          },
        }),
      });

      const html = injectContent(replaceSeoBlock(baseHtml, headBlock), {
        h1: blog.title,
        description: bDesc,
        breadcrumbs,
      });

      writeFile(path.join('blog', `${slug}.html`), html);
      manifest[routePath] = path.join('blog', `${slug}.html`);
      console.log(`  ✓ Prerendered ${routePath} (canonical ${canonical})`);
    }

    // Persist the manifest so the Express server and the redirect rules can
    // resolve a request path to its prerendered file.
    fs.writeFileSync(
      path.join(DIST_DIR, 'route-manifest.json'),
      JSON.stringify(manifest, null, 2),
      'utf-8'
    );

    console.log('Prerendering completed successfully!');
    console.log(`  OG images saved to: dist/og-images/ (${fs.readdirSync(OG_IMAGES_DIR).length} files)`);
    console.log(`  Routes in manifest : ${Object.keys(manifest).length}`);
    process.exit(0);
  } catch (error) {
    console.error('Prerendering failed:', error);
    process.exit(1);
  }
}

runPrerender();
