import fs from 'fs';
import path from 'path';
import { initializeApp } from 'firebase/app';
import { collection, getDocs, initializeFirestore, doc, getDoc } from 'firebase/firestore';

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

const BASE_URL = "https://jaiminumaraniya.me";
const DIST_DIR = path.join(process.cwd(), 'dist');
const OG_IMAGES_DIR = path.join(DIST_DIR, 'og-images');
const FALLBACK_OG_IMAGE = `${BASE_URL}/OG.jpg`;

// â”€â”€ Image helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

/**
 * If `dataUri` is a base64 data URI, writes the decoded bytes to `filePath`
 * and returns the public HTTPS URL. Otherwise returns null.
 */
function extractBase64ToFile(dataUri, filePath) {
  if (!dataUri || typeof dataUri !== 'string') return null;
  const match = dataUri.match(/^data:([a-zA-Z0-9+/]+\/[a-zA-Z0-9+/]+);base64,(.+)$/s);
  if (!match) return null;
  try {
    const buffer = Buffer.from(match[2], 'base64');
    fs.writeFileSync(filePath, buffer);
    return true;
  } catch {
    return null;
  }
}

/**
 * For a given list of candidate image values, returns a crawlable HTTPS URL:
 *  - If already an https:// URL: use it directly.
 *  - If a base64 data URI: save it to dist/og-images/ and return the HTTPS URL.
 *  - Otherwise: return null (caller should use FALLBACK_OG_IMAGE).
 */
function resolveOgImage(candidates, fileName) {
  for (const img of candidates) {
    if (!img || typeof img !== 'string') continue;

    // Already a real URL
    if (img.startsWith('https://') || img.startsWith('http://')) {
      return img;
    }

    // Base64 â€” extract to file
    if (img.startsWith('data:')) {
      const filePath = path.join(OG_IMAGES_DIR, fileName);
      const ok = extractBase64ToFile(img, filePath);
      if (ok) {
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

// â”€â”€ HTML injection â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function injectSEO(html, { title, description, keywords, ogImage, h1, content, schema, canonicalUrl }) {
  let modified = html;
  const resolvedOgImage = ogImage || FALLBACK_OG_IMAGE;

  // Replace <title>
  modified = modified.replace(/<title>.*?<\/title>/i, `<title>${title}</title>`);

  // Replace/inject <meta name="description">
  if (description) {
    const descRegex = /<meta\s+name=["']description["']\s+content=["'][^"']*["']\s*\/?>\n?/i;
    const newDesc = `<meta name="description" content="${description.replace(/"/g, '&quot;')}">\n`;
    if (descRegex.test(modified)) {
      modified = modified.replace(descRegex, newDesc);
    } else {
      modified = modified.replace('</head>', `  ${newDesc}</head>`);
    }
  }

  // Update OG image tags (Vite self-closing format: " />")
  modified = modified.replace(
    /(<meta property="og:image" content=")[^"]*(" \/>)/,
    `$1${resolvedOgImage}$2`
  );
  modified = modified.replace(
    /(<meta name="twitter:image" content=")[^"]*(" \/>)/,
    `$1${resolvedOgImage}$2`
  );

  // Update per-page og:title, og:description, twitter:title, twitter:description
  const safeTitle = title.replace(/"/g, '&quot;');
  const safeDesc = description ? description.replace(/"/g, '&quot;') : '';

  modified = modified.replace(
    /(<meta property="og:title" content=")[^"]*(" \/>)/,
    `$1${safeTitle}$2`
  );
  modified = modified.replace(
    /(<meta name="twitter:title" content=")[^"]*(" \/>)/,
    `$1${safeTitle}$2`
  );
  if (description) {
    modified = modified.replace(
      /(<meta property="og:description" content=")[^"]*(" \/>)/,
      `$1${safeDesc}$2`
    );
    modified = modified.replace(
      /(<meta name="twitter:description" content=")[^"]*(" \/>)/,
      `$1${safeDesc}$2`
    );
  }

  // Append extra head tags (keywords, JSON-LD, canonical)
  let headAdditions = '';
  if (canonicalUrl) {
    headAdditions += `  <link rel="canonical" href="${canonicalUrl}" />\n`;
  }
  if (keywords) {
    headAdditions += `  <meta name="keywords" content="${Array.isArray(keywords) ? keywords.join(', ') : keywords}">\n`;
  }
  if (schema) {
    headAdditions += `  <script type="application/ld+json">\n${JSON.stringify(schema, null, 2)}\n  </script>\n`;
  }
  if (headAdditions) {
    modified = modified.replace('</head>', `${headAdditions}</head>`);
  }

  // Inject hidden semantic HTML for crawlers
  if (h1 || content) {
    const h1Tag = h1 ? `<h1>${h1}</h1>` : '';
    const descTag = description ? `<p class="prerender-desc">${description}</p>` : '';
    const extraContent = content ? `<div class="prerender-content">${content}</div>` : '';
    const contentToInject = `<div style="padding:2rem;max-width:800px;margin:0 auto;font-family:sans-serif;opacity:1;position:relative;">${h1Tag}${descTag}${extraContent}</div>`;
    modified = modified.replace('<div id="root"></div>', `<div id="root">${contentToInject}</div>`);
  }

  return modified;
}

// â”€â”€ Main â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

async function runPrerender() {
  console.log("Starting Build-Time Prerendering for SEO...");

  if (!fs.existsSync(DIST_DIR)) {
    console.error("Error: dist directory not found. Run 'vite build' first.");
    process.exit(1);
  }

  // Ensure og-images dir exists
  ensureDir(OG_IMAGES_DIR);

  const baseHtml = fs.readFileSync(path.join(DIST_DIR, 'index.html'), 'utf-8');

  try {
    // 1. Fetch Global Settings
    console.log("Fetching global settings...");
    const settingsDoc = await getDoc(doc(db, 'settings', 'global'));
    const settings = settingsDoc.data() || {};
    const globalTitle = settings.seoTitle || settings.siteName || "Jaimin Umaraniya";

    // 2. Fetch Projects
    console.log("Fetching projects...");
    const projectsSnap = await getDocs(collection(db, 'projects'));
    const projects = [];
    projectsSnap.forEach(d => {
      const data = d.data();
      if (data.status === "Published") projects.push({ id: d.id, ...data });
    });

    // 3. Fetch Blogs
    console.log("Fetching blogs...");
    const blogsSnap = await getDocs(collection(db, 'blogs'));
    const blogs = [];
    blogsSnap.forEach(d => {
      const data = d.data();
      if (data.status === "Published") blogs.push({ id: d.id, ...data });
    });

    // â”€â”€ VALIDATION PHASE â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    console.log("Validating SEO requirements...");
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
      if (!project.title) {
        console.warn(`[SEO WARNING] Project "${project.id}" is missing a title.`);
      }
      if (!project.seoDescription && !project.shortDescription && !project.subtitle) {
        console.warn(`[SEO WARNING] Project "${project.id}" is missing a description.`);
      }
    }

    if (hasErrors) {
      console.warn("Validation had errors but continuing prerender for valid pages.");
    }

    // â”€â”€ HOMEPAGE (/) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const homeHtml = injectSEO(baseHtml, {
      title: globalTitle,
      description: settings.seoDescription || "Portfolio of Jaimin Umaraniya, Full Stack Developer and Designer.",
      keywords: settings.seoKeywords,
      ogImage: FALLBACK_OG_IMAGE, // Always use canonical OG for homepage
      h1: "Jaimin Umaraniya - Senior Full Stack & AI Developer",
      canonicalUrl: BASE_URL,
      schema: {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "url": BASE_URL,
        "name": globalTitle
      }
    });
    fs.writeFileSync(path.join(DIST_DIR, 'index.html'), homeHtml);
    console.log("âœ“ Prerendered /");

    // â”€â”€ PROJECTS LISTING (/projects) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    
    const projectsListHtml = injectSEO(baseHtml, {
      title: "Works | Jaimin Umaraniya â€” Production-Grade Case Studies",
      description: "A selection of production-grade applications, SaaS platforms, and AI-powered digital experiences engineered by Jaimin Umaraniya.",
      ogImage: FALLBACK_OG_IMAGE,
      h1: "Works and Projects",
      canonicalUrl: `${BASE_URL}/projects`,
      schema: {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        "url": `${BASE_URL}/projects`,
        "name": "Works â€” Jaimin Umaraniya"
      }
    });
    fs.writeFileSync(path.join(DIST_DIR, 'projects.html'), projectsListHtml);
    console.log("âœ“ Prerendered /projects");

    // â”€â”€ BLOG LISTING (/blog) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    
    const blogListHtml = injectSEO(baseHtml, {
      title: "Blog | Technical Articles & Thoughts",
      description: "Read my latest technical articles, engineering deep-dives, and thoughts on AI, web development, and software architecture.",
      ogImage: FALLBACK_OG_IMAGE,
      h1: "Technical Blog & Articles",
      canonicalUrl: `${BASE_URL}/blog`,
      schema: {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        "url": `${BASE_URL}/blog`,
        "name": "Blog â€” Jaimin Umaraniya"
      }
    });
    fs.writeFileSync(path.join(DIST_DIR, 'blog.html'), blogListHtml);
    console.log("âœ“ Prerendered /blog");

    // â”€â”€ INDIVIDUAL PROJECTS (/projects/:id) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    for (const project of projects) {
      ensureDir(path.join(DIST_DIR, 'projects'));

      const pTitle = `${project.title} | Case Study`;
      const pDesc = project.seoDescription || project.shortDescription || project.subtitle || project.description;

      // Extract image from base64 or use HTTPS URL
      const pImage = resolveOgImage(
        [project.seoImage, project.ogImage, project.thumbnail, project.featuredImage, project.image],
        `project-${project.id}.jpg`
      );

      const pHtml = injectSEO(baseHtml, {
        title: pTitle,
        description: pDesc,
        keywords: project.seoKeywords || project.techStack,
        ogImage: pImage,
        h1: project.title,
        content: project.fullDescription || project.challenges || project.content,
        canonicalUrl: `${BASE_URL}/projects/${project.id}`,
        schema: {
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          "name": project.title,
          "headline": project.title,
          "description": pDesc,
          "image": pImage,
          "author": { "@type": "Person", "name": "Jaimin Umaraniya" },
          "url": `${BASE_URL}/projects/${project.id}`
        }
      });
      fs.writeFileSync(path.join(DIST_DIR, 'projects', project.id + '.html'), pHtml);
      console.log(`  âœ“ Prerendered /projects/${project.id} (og: ${pImage.includes('/og-images/') ? 'extracted' : pImage.includes('OG.jpg') ? 'fallback' : 'https'})`);
    }

    // â”€â”€ INDIVIDUAL BLOGS (/blog/:slug) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    for (const blog of blogs) {
      const slug = (blog.slug || blog.id).toLowerCase();
      ensureDir(path.join(DIST_DIR, 'blog'));

      const bTitle = `${blog.title} | Technical Blog`;
      const bDesc = blog.seoDescription || blog.excerpt || blog.shortDescription;

      // Extract image from base64 or use HTTPS URL
      const bImage = resolveOgImage(
        [blog.seoImage, blog.ogImage, blog.image],
        `blog-${slug}.jpg`
      );

      const bHtml = injectSEO(baseHtml, {
        title: bTitle,
        description: bDesc,
        keywords: blog.seoKeywords || blog.tags,
        ogImage: bImage,
        h1: blog.title,
        content: blog.content,
        canonicalUrl: `${BASE_URL}/blog/${slug}`,
        schema: {
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          "headline": blog.title,
          "description": bDesc,
          "image": bImage,
          "author": { "@type": "Person", "name": "Jaimin Umaraniya" },
          "datePublished": blog.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
          "url": `${BASE_URL}/blog/${slug}`
        }
      });
      fs.writeFileSync(path.join(DIST_DIR, 'blog', slug + '.html'), bHtml);
      console.log(`  âœ“ Prerendered /blog/${slug} (og: ${bImage.includes('/og-images/') ? 'extracted' : bImage.includes('OG.jpg') ? 'fallback' : 'https'})`);
    }

    console.log("Prerendering completed successfully!");
    console.log(`  OG images saved to: dist/og-images/ (${fs.readdirSync(OG_IMAGES_DIR).length} files)`);
    process.exit(0);

  } catch (error) {
    console.error("Prerendering failed:", error);
    process.exit(1);
  }
}

runPrerender();


