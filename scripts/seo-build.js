import fs from "node:fs";
import path from "node:path";
import { initializeApp } from "firebase/app";
import { collection, getDocs, initializeFirestore, query, where } from "firebase/firestore";
import { marked } from "marked";

const BASE_URL = "https://jaiminumaraniya.me";
const DIST_DIR = path.join(process.cwd(), "dist");
const PUBLIC_DIR = path.join(process.cwd(), "public");

const firebaseConfig = {
  projectId: "astute-abbey-p1wkv",
  appId: "1:509171019192:web:4aba69e3e6ad580df2334d",
  apiKey: "AIzaSyAPch8N_4oxiFv8iKhIJ2zTVgbTGt32nHI",
  authDomain: "astute-abbey-p1wkv.firebaseapp.com",
  storageBucket: "astute-abbey-p1wkv.firebasestorage.app",
  messagingSenderId: "509171019192",
};

const app = initializeApp(firebaseConfig);
const db = initializeFirestore(app, {}, "ai-studio-72db9056-9c78-47ef-8e14-18be539b546c");

const staticPages = [
  {
    path: "/",
    file: "index.html",
    title: "Jaimin Umaraniya | Full-Stack Developer & AI Engineer",
    description:
      "Jaimin Umaraniya is a Full-Stack Developer and AI Engineer specializing in React, Next.js, Node.js, AI-powered applications, SaaS architecture, technical SEO, and high-performance web experiences.",
    h1: "Full-Stack Developer & AI Engineer",
    schemaType: "WebPage",
    content: `<p>Full-stack developer and AI engineer building web applications, SaaS products, and AI-powered experiences.</p>
      <nav aria-label="Primary pages"><a href="/projects">Projects</a> · <a href="/blog">Blog</a> · <a href="/contact">Contact</a></nav>`,
  },
  {
    path: "/projects",
    file: "projects.html",
    title: "Works | Jaimin Umaraniya — Production-Grade Case Studies",
    description:
      "A selection of production-grade applications, SaaS platforms, and AI-powered digital experiences engineered by Jaimin Umaraniya.",
    h1: "Works",
    schemaType: "CollectionPage",
  },
  {
    path: "/blog",
    file: "blog.html",
    title: "Blog | Technical Articles & Thoughts | Jaimin Umaraniya",
    description:
      "Read my latest technical articles, engineering deep-dives, and thoughts on AI, web development, and software architecture.",
    h1: "Blog",
    schemaType: "CollectionPage",
  },
  {
    path: "/contact",
    file: "contact.html",
    title: "Contact Jaimin Umaraniya | Full-Stack Developer",
    description:
      "Contact Jaimin Umaraniya about full-stack development, AI engineering, consulting, or your next software project.",
    h1: "Let's Start Something Great.",
    schemaType: "ContactPage",
    content: `<p>I'm currently available for freelance work and open to full-time opportunities. Use the contact form to discuss your next project.</p>`,
  },
  {
    path: "/privacy-policy",
    file: "privacy-policy.html",
    title: "Privacy Policy | Jaimin Umaraniya",
    description: "Learn how information submitted through Jaimin Umaraniya's portfolio website is used and stored.",
    h1: "Privacy Policy",
    schemaType: "WebPage",
    content: `<h2>Information collection</h2><p>Information submitted through the contact form, including your name, email address, and message, is used to respond to inquiries and discuss potential work.</p>
      <h2>Use and storage</h2><p>Submitted information is used to respond to your inquiry. Contact form data is stored using cloud infrastructure and is not sold.</p>
      <h2>Cookies and analytics</h2><p>This site uses local storage to cache content for offline support and improve performance. Site analytics may be used to understand website traffic.</p>`,
  },
  {
    path: "/refund-policy",
    file: "refund-policy.html",
    title: "Refund Policy | Jaimin Umaraniya",
    description: "Review the refund and cancellation terms for freelance services and development projects.",
    h1: "Refund Policy",
    schemaType: "WebPage",
    content: `<h2>Service contracts</h2><p>Refunds for freelance services and development projects are governed by the terms in the applicable project contract or statement of work.</p>
      <h2>Retainers and deposits</h2><p>Unless otherwise agreed in writing, initial project deposits and monthly retainer fees are non-refundable because they reserve time and resources.</p>
      <h2>Cancellations</h2><p>If a project is cancelled before completion, completed work and incurred expenses are billed. Remaining deposit balances are evaluated under the applicable contract.</p>`,
  },
];

function htmlEscape(value = "") {
  return String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[char]);
}

function plainText(value = "") {
  return String(value)
    .replace(/<[^>]*>/g, " ")
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/[#*_>`~-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function absoluteUrl(value) {
  if (typeof value !== "string" || !value.trim() || value.startsWith("data:")) {
    return `${BASE_URL}/OG.jpg`;
  }
  if (/^https:\/\//i.test(value)) return value;
  if (/^http:\/\//i.test(value)) return `${BASE_URL}/OG.jpg`;
  return `${BASE_URL}/${value.replace(/^\/+/, "")}`;
}

function formatDate(value) {
  const date = value?.toDate?.()
    ?? (value instanceof Date ? value : typeof value === "string" ? new Date(value) : null);
  return date && !Number.isNaN(date.getTime()) ? date.toISOString() : undefined;
}

function lastModified(item) {
  const date = formatDate(item.updatedAt) || formatDate(item.createdAt);
  return date?.slice(0, 10);
}

function publishedSlug(item) {
  const rawSlug = String(item.slug || item.id || "").trim().toLowerCase();
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(rawSlug)) {
    throw new Error(`Invalid public slug for "${item.title || item.id}": ${rawSlug || "(empty)"}`);
  }
  return rawSlug;
}

async function getPublished(collectionName) {
  const snapshot = await getDocs(
    query(collection(db, collectionName), where("status", "==", "Published")),
  );
  return snapshot.docs.map((document) => ({ id: document.id, ...document.data() }));
}

function xmlEscape(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&apos;",
  })[char]);
}

function routeRecord(route, modified) {
  return { url: route, modified };
}

function createSitemap(routes) {
  const entries = routes.map(({ url, modified }) => `  <url>
    <loc>${xmlEscape(`${BASE_URL}${url === "/" ? "/" : url}`)}</loc>${modified ? `
    <lastmod>${modified}</lastmod>` : ""}
  </url>`).join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries}\n</urlset>\n`;
}

function safeSchemaJson(value) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

function stripExistingSeo(html) {
  return html
    .replace(/<title\b[^>]*>[\s\S]*?<\/title>/gi, "")
    .replace(/<meta\b(?=[^>]*(?:name|property)=["'](?:description|keywords|author|robots|twitter:[^"']+|og:[^"']+)["'])[^>]*>\s*/gi, "")
    .replace(/<link\b(?=[^>]*rel=["']canonical["'])[^>]*>\s*/gi, "")
    .replace(/<script\b(?=[^>]*type=["']application\/ld\+json["'])[^>]*>[\s\S]*?<\/script>\s*/gi, "");
}

function pageSchema(route, page, extra = []) {
  const canonical = `${BASE_URL}${route === "/" ? "/" : route}`;
  const pageId = `${canonical}#webpage`;
  const personId = `${BASE_URL}/#person`;
  const websiteId = `${BASE_URL}/#website`;
  const graph = [
    {
      "@type": "Person",
      "@id": personId,
      name: "Jaimin Umaraniya",
      url: BASE_URL,
      image: `${BASE_URL}/OG.jpg`,
      jobTitle: "Full-Stack Developer & AI Engineer",
    },
    {
      "@type": "WebSite",
      "@id": websiteId,
      url: BASE_URL,
      name: "Jaimin Umaraniya",
      publisher: { "@id": personId },
    },
    {
      "@type": page.schemaType || "WebPage",
      "@id": pageId,
      url: canonical,
      name: page.title,
      description: page.description,
      isPartOf: { "@id": websiteId },
    },
  ];
  if (route !== "/") {
    const segments = route.split("/").filter(Boolean);
    const crumbs = [{ name: "Home", item: `${BASE_URL}/` }];
    let pathSoFar = "";
    for (const segment of segments) {
      pathSoFar += `/${segment}`;
      const name = segment === "projects" ? "Projects"
        : segment === "blog" ? "Blog"
          : page.breadcrumbTitle || page.title;
      crumbs.push({ name, item: `${BASE_URL}${pathSoFar}` });
    }
    graph.push({
      "@type": "BreadcrumbList",
      itemListElement: crumbs.map((crumb, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: crumb.name,
        item: crumb.item,
      })),
    });
  }
  graph.push(...extra);
  return { "@context": "https://schema.org", "@graph": graph };
}

function metadataTags(route, page, image, schema, noindex = false) {
  const canonical = `${BASE_URL}${route === "/" ? "/" : route}`;
  const ogType = page.ogType || "website";
  const tags = [
    `<title>${htmlEscape(page.title)}</title>`,
    `<meta name="description" content="${htmlEscape(page.description)}">`,
    `<meta name="author" content="${htmlEscape(page.author || "Jaimin Umaraniya")}">`,
    `<meta name="robots" content="${noindex ? "noindex,nofollow" : "index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1"}">`,
    `<link rel="canonical" href="${htmlEscape(canonical)}">`,
    `<meta property="og:type" content="${ogType}">`,
    `<meta property="og:site_name" content="Jaimin Umaraniya">`,
    `<meta property="og:url" content="${htmlEscape(canonical)}">`,
    `<meta property="og:title" content="${htmlEscape(page.title)}">`,
    `<meta property="og:description" content="${htmlEscape(page.description)}">`,
    `<meta property="og:image" content="${htmlEscape(image)}">`,
    `<meta property="og:image:alt" content="${htmlEscape(page.imageAlt || page.title)}">`,
    `<meta property="og:image:width" content="1200">`,
    `<meta property="og:image:height" content="630">`,
    `<meta name="twitter:card" content="summary_large_image">`,
    `<meta name="twitter:site" content="@jaimin_dev">`,
    `<meta name="twitter:creator" content="@jaimin_dev">`,
    `<meta name="twitter:title" content="${htmlEscape(page.title)}">`,
    `<meta name="twitter:description" content="${htmlEscape(page.description)}">`,
    `<meta name="twitter:image" content="${htmlEscape(image)}">`,
    `<meta name="twitter:image:alt" content="${htmlEscape(page.imageAlt || page.title)}">`,
  ];
  if (ogType === "article") {
    if (page.publishedTime) tags.push(`<meta property="article:published_time" content="${htmlEscape(page.publishedTime)}">`);
    if (page.modifiedTime) tags.push(`<meta property="article:modified_time" content="${htmlEscape(page.modifiedTime)}">`);
    if (page.author) tags.push(`<meta property="article:author" content="${htmlEscape(page.author)}">`);
    if (page.category) tags.push(`<meta property="article:section" content="${htmlEscape(page.category)}">`);
    for (const tag of page.tags || []) tags.push(`<meta property="article:tag" content="${htmlEscape(tag)}">`);
  }
  tags.push(`<script type="application/ld+json">${safeSchemaJson(schema)}</script>`);
  return tags.join("\n    ");
}

function breadcrumbHtml(route, page) {
  const segments = route.split("/").filter(Boolean);
  if (!segments.length) return "";
  const crumbs = [{ name: "Home", href: "/" }];
  let current = "";
  segments.forEach((segment, index) => {
    current += `/${segment}`;
    const name = segment === "projects" ? "Projects"
      : segment === "blog" ? "Blog"
        : (page.breadcrumbTitle || page.title);
    crumbs.push({ name, href: index === segments.length - 1 ? null : current });
  });
  return `<nav aria-label="Breadcrumb"><ol>${crumbs.map((crumb, index) => `<li>${crumb.href
    ? `<a href="${htmlEscape(crumb.href)}">${htmlEscape(crumb.name)}</a>`
    : `<span aria-current="page">${htmlEscape(crumb.name)}</span>`}${index < crumbs.length - 1 ? " &gt; " : ""}</li>`).join("")}</ol></nav>`;
}

function contentMarkup(content) {
  if (!content) return "";
  const value = String(content);
  const html = /<(?:p|h[1-6]|ul|ol|div|blockquote|pre|table|figure)\b/i.test(value)
    ? value
    : marked.parse(value);
  return String(html).replace(/<\/?h1\b/gi, (tag) => tag.replace(/h1/i, tag.startsWith("</") ? "h2" : "h2"));
}

function renderPage(baseHtml, route, page, body, image, extraSchema = []) {
  const html = stripExistingSeo(baseHtml);
  const schema = pageSchema(route, page, extraSchema);
  const tags = metadataTags(route, page, image || `${BASE_URL}/OG.jpg`, schema);
  const breadcrumb = breadcrumbHtml(route, page);
  const main = `<main id="seo-prerender">${breadcrumb}<h1>${htmlEscape(page.h1)}</h1><p>${htmlEscape(page.description)}</p>${body}</main>`;
  return html
    .replace("</head>", `    ${tags}\n  </head>`)
    .replace('<div id="root"></div>', `<div id="root">${main}</div>`);
}

function projectMarkup(project) {
  const sections = [];
  const intro = project.fullDescription || project.content || project.description || project.shortDescription || "";
  if (intro) sections.push(`<section><h2>Overview</h2>${contentMarkup(intro)}</section>`);
  const technologies = Array.isArray(project.techStack)
    ? project.techStack
    : String(project.techStack || "").split(/[,|]/).map((entry) => entry.trim()).filter(Boolean);
  if (technologies.length) {
    sections.push(`<section><h2>Technologies</h2><ul>${technologies.map((item) => `<li>${htmlEscape(item)}</li>`).join("")}</ul></section>`);
  }
  if (Array.isArray(project.features) && project.features.length) {
    sections.push(`<section><h2>Features</h2><ul>${project.features.map((item) => `<li>${htmlEscape(item)}</li>`).join("")}</ul></section>`);
  }
  for (const [label, value] of [["Challenges", project.challenges], ["Results", project.results]]) {
    if (value) sections.push(`<section><h2>${label}</h2>${contentMarkup(value)}</section>`);
  }
  const liveUrl = project.liveUrl || project.links?.live;
  const githubUrl = project.githubUrl || project.links?.github;
  if (liveUrl || githubUrl) {
    sections.push(`<nav aria-label="Project links">${liveUrl ? `<a href="${htmlEscape(liveUrl)}" rel="nofollow">Visit project</a>` : ""}${liveUrl && githubUrl ? " · " : ""}${githubUrl ? `<a href="${htmlEscape(githubUrl)}" rel="nofollow">Source code</a>` : ""}</nav>`);
  }
  return `<p>${htmlEscape(project.category || "Project")}${project.role ? ` · ${htmlEscape(project.role)}` : ""}</p>
    ${sections.join("\n")}
    <p><a href="/projects">All projects</a></p>`;
}

function blogMarkup(post) {
  const content = post.content || post.body || "";
  const html = contentMarkup(content);
  const fallback = post.excerpt || post.introduction || "";
  const details = html || (fallback ? `<p>${htmlEscape(fallback)}</p>` : "");
  const published = formatDate(post.createdAt || post.publishedAt);
  return `<p>${post.category ? `<span>${htmlEscape(post.category)}</span> · ` : ""}${post.authorName ? `By ${htmlEscape(post.authorName)}` : "By Jaimin Umaraniya"}</p>
    ${published ? `<time datetime="${htmlEscape(published)}">${htmlEscape(published.slice(0, 10))}</time>` : ""}
    <article>${details}</article>
    <p><a href="/blog">All articles</a></p>`;
}

function writePage(file, html) {
  const fullPath = path.join(DIST_DIR, file);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, html, "utf8");
}

async function build() {
  if (!fs.existsSync(path.join(DIST_DIR, "index.html"))) {
    throw new Error("dist/index.html is missing. Run vite build before SEO generation.");
  }

  const [projects, blogs] = await Promise.all([
    getPublished("projects"),
    getPublished("blogs"),
  ]);

  const projectRoutes = projects.map((project) => ({ item: project, slug: publishedSlug(project) }));
  const blogRoutes = blogs.map((post) => ({ item: post, slug: publishedSlug(post) }));
  for (const [kind, routes] of [["project", projectRoutes], ["blog", blogRoutes]]) {
    const seen = new Set();
    for (const { item, slug } of routes) {
      if (seen.has(slug)) throw new Error(`Duplicate published ${kind} slug: ${slug}`);
      seen.add(slug);
      if (!item.title || !plainText(item.title)) throw new Error(`Published ${kind} "${slug}" has no title.`);
    }
  }

  const baseHtml = fs.readFileSync(path.join(DIST_DIR, "index.html"), "utf8");
  const routes = staticPages.map((page) => routeRecord(page.path, undefined));

  for (const page of staticPages) {
    let body = page.content || "";
    if (page.path === "/projects") {
      body = `<ul>${projectRoutes.map(({ item, slug }) => `<li><a href="/projects/${slug}">${htmlEscape(item.title)}</a>${item.shortDescription || item.description ? ` — ${htmlEscape(item.shortDescription || item.description)}` : ""}</li>`).join("")}</ul>`;
    } else if (page.path === "/blog") {
      body = `<ul>${blogRoutes.map(({ item, slug }) => `<li><a href="/blog/${slug}">${htmlEscape(item.title)}</a>${item.excerpt ? ` — ${htmlEscape(item.excerpt)}` : ""}</li>`).join("")}</ul>`;
    }
    const html = renderPage(baseHtml, page.path, page, body, `${BASE_URL}/OG.jpg`);
    writePage(page.file, html);
  }

  for (const { item, slug } of projectRoutes) {
    const route = `/projects/${slug}`;
    const description = plainText(item.seoDescription || item.shortDescription || item.description || item.fullDescription || "");
    if (!description) throw new Error(`Published project "${slug}" has no useful description.`);
    const page = {
      title: `${item.seoTitle || item.title} | Project Case Study`,
      description,
      h1: item.title,
      breadcrumbTitle: item.title,
      schemaType: "WebPage",
      ogType: "article",
      author: "Jaimin Umaraniya",
    };
    const image = absoluteUrl(item.seoImage || item.ogImage || item.thumbnail || item.featuredImage || item.heroImage || item.image);
    const extraSchema = [{
      "@type": "SoftwareApplication",
      "@id": `${BASE_URL}${route}#software`,
      name: item.title,
      description,
      url: `${BASE_URL}${route}`,
      image,
      applicationCategory: item.category || "WebApplication",
      ...(Array.isArray(item.techStack) ? { programmingLanguage: item.techStack } : {}),
      author: { "@id": `${BASE_URL}/#person` },
    }];
    writePage(path.join("projects", `${slug}.html`), renderPage(baseHtml, route, page, projectMarkup(item), image, extraSchema));
    routes.push(routeRecord(route, lastModified(item)));
  }

  for (const { item, slug } of blogRoutes) {
    const route = `/blog/${slug}`;
    const description = plainText(item.seoDescription || item.excerpt || item.shortDescription || item.introduction || "");
    if (!description) throw new Error(`Published blog "${slug}" has no useful description.`);
    const published = formatDate(item.createdAt || item.publishedAt);
    const modified = formatDate(item.updatedAt || item.modifiedAt) || published;
    const authorName = item.authorName || item.author?.name || "Jaimin Umaraniya";
    const page = {
      title: `${item.seoTitle || item.title} | Jaimin Umaraniya`,
      description,
      h1: item.title,
      breadcrumbTitle: item.title,
      schemaType: "WebPage",
      ogType: "article",
      author: authorName,
      publishedTime: published,
      modifiedTime: modified,
      category: item.category,
      tags: item.tags ? (Array.isArray(item.tags) ? item.tags : String(item.tags).split(",").map((tag) => tag.trim())) : [],
    };
    const image = absoluteUrl(item.seoImage || item.ogImage || item.image);
    const extraSchema = [{
      "@type": "BlogPosting",
      "@id": `${BASE_URL}${route}#article`,
      headline: item.title,
      description,
      image: [image],
      url: `${BASE_URL}${route}`,
      mainEntityOfPage: { "@id": `${BASE_URL}${route}#webpage` },
      author: authorName === "Jaimin Umaraniya"
        ? { "@id": `${BASE_URL}/#person` }
        : { "@type": "Person", name: authorName },
      publisher: { "@id": `${BASE_URL}/#person` },
      ...(published ? { datePublished: published } : {}),
      ...(modified ? { dateModified: modified } : {}),
      ...(item.category ? { articleSection: item.category } : {}),
      ...(item.tags ? { keywords: Array.isArray(item.tags) ? item.tags.join(", ") : String(item.tags) } : {}),
    }];
    writePage(path.join("blog", `${slug}.html`), renderPage(baseHtml, route, page, blogMarkup(item), image, extraSchema));
    routes.push(routeRecord(route, lastModified(item)));
  }

  const sitemap = createSitemap(routes);
  fs.writeFileSync(path.join(PUBLIC_DIR, "sitemap.xml"), sitemap, "utf8");
  fs.writeFileSync(path.join(DIST_DIR, "sitemap.xml"), sitemap, "utf8");

  const noindexHtml = stripExistingSeo(baseHtml)
    .replace("</head>", `    <title>Private tools | Jaimin Umaraniya</title>\n    <meta name="robots" content="noindex,nofollow">\n  </head>`)
    .replace('<div id="root"></div>', '<div id="root"></div>');
  writePage("admin.html", noindexHtml);

  const notFoundHtml = stripExistingSeo(baseHtml)
    .replace("</head>", `    <title>Page not found | Jaimin Umaraniya</title>\n    <meta name="robots" content="noindex,nofollow">\n  </head>`)
    .replace('<div id="root"></div>', '<div id="root"><main><h1>Page not found</h1><p>The page you requested does not exist.</p><a href="/">Return home</a></main></div>');
  writePage("404.html", notFoundHtml);

  console.log(`Generated ${routes.length} canonical sitemap URLs (${projectRoutes.length} projects, ${blogRoutes.length} articles).`);
}

build().catch((error) => {
  console.error("SEO build failed:", error);
  process.exitCode = 1;
});
