/**
 * Single source of truth for canonical URLs, the public route registry and the
 * route metadata that is rendered BOTH by react-helmet-async (client) and by
 * the build-time prerenderer / express server (server).
 *
 * Keeping this in one place guarantees that:
 *  - every indexable route emits exactly ONE absolute, self-referencing canonical
 *  - the sitemap, canonical URLs and internal links can never drift apart
 *  - private routes (admin / auth / tooling) are never indexable
 */

/** Production origin. Canonical URLs are ALWAYS absolute against this host. */
export const CANONICAL_ORIGIN = "https://jaiminumaraniya.me";

/** Alias kept for readability in build scripts. */
export const BASE_URL = CANONICAL_ORIGIN;

export const SITE_NAME = "Jaimin Umaraniya";

export const DEFAULT_OG_IMAGE = "/OG.jpg";

export const DEFAULT_KEYWORDS = [
  "Jaimin Umaraniya",
  "Full-Stack Developer",
  "AI Engineer",
  "React",
  "Next.js",
  "Node.js",
  "TypeScript",
  "SaaS Architecture",
  "Technical SEO",
];

/**
 * Public, indexable routes. `file` is the prerendered HTML file written into
 * `dist/`, `path` is the URL path that is served by that file.
 */
export const PUBLIC_ROUTES = [
  {
    path: "/",
    file: "index.html",
    title: "Jaimin Umaraniya | Full-Stack Developer & AI Engineer",
    description:
      "Jaimin Umaraniya is a Full-Stack Developer and AI Engineer specializing in React, Next.js, Node.js, AI-powered applications, SaaS architecture, technical SEO, and high-performance web experiences.",
    h1: "Full-Stack Developer & AI Engineer",
    schemaType: "WebPage",
    changefreq: "daily",
    priority: "1.0",
    keywords: [
      "Jaimin Umaraniya",
      "Jaimin Portfolio",
      "Portfolio Jaimin",
      "Jaimin Full Stack Developer",
      "Jaimin Software Engineer",
      "React Developer Portfolio",
      "Next.js Developer",
      "TypeScript Developer",
      "Frontend Developer India",
      "Full Stack Developer Ahmedabad",
      "Software Engineer Ahmedabad",
      "Firebase Developer",
      "AI Developer",
      "Modern Developer Portfolio",
      "React Portfolio",
      "Next.js Portfolio",
      "Web Developer Portfolio",
      "JavaScript Developer",
      "Software Engineer Portfolio",
      "Portfolio Website",
    ],
  },
  {
    path: "/projects",
    file: "projects.html",
    title: "Works | Jaimin Umaraniya — Production-Grade Case Studies",
    description:
      "A selection of production-grade applications, SaaS platforms, and AI-powered digital experiences engineered by Jaimin Umaraniya.",
    h1: "Works",
    schemaType: "CollectionPage",
    changefreq: "weekly",
    priority: "0.9",
    keywords: [
      "Jaimin Umaraniya Projects",
      "React Portfolio",
      "Next.js Case Studies",
      "Full Stack Development Work",
      "Software Engineering Portfolio",
    ],
  },
  {
    path: "/blog",
    file: "blog.html",
    title: "Blog | Technical Articles & Thoughts | Jaimin Umaraniya",
    description:
      "Read my latest technical articles, engineering deep-dives, and thoughts on AI, web development, and software architecture.",
    h1: "Blog",
    schemaType: "CollectionPage",
    changefreq: "weekly",
    priority: "0.9",
    keywords: [
      "Technical Blog",
      "Web Development Articles",
      "Software Engineering Insights",
      "AI Development Blog",
      "Frontend Architecture",
      "Full Stack Developer Blog",
    ],
  },
  {
    path: "/contact",
    file: "contact.html",
    title: "Contact Jaimin Umaraniya",
    description:
      "I'm currently available for freelance work and open to full-time opportunities. Drop a message to discuss your next project.",
    h1: "Let's Start Something Great.",
    schemaType: "ContactPage",
    changefreq: "monthly",
    priority: "0.8",
  },
  {
    path: "/privacy-policy",
    file: "privacy-policy.html",
    title: "Privacy Policy | Jaimin Umaraniya",
    description: "Learn how information submitted through Jaimin Umaraniya's portfolio website is collected, used, and stored.",
    h1: "Privacy Policy",
    schemaType: "WebPage",
    changefreq: "yearly",
    priority: "0.4",
  },
  {
    path: "/refund-policy",
    file: "refund-policy.html",
    title: "Refund Policy | Jaimin Umaraniya",
    description: "Review the refund and cancellation terms for freelance services and development projects.",
    h1: "Refund Policy",
    schemaType: "WebPage",
    changefreq: "yearly",
    priority: "0.3",
  },
];

/**
 * Private routes: admin, authentication and internal tooling. These are
 * excluded from the sitemap and rendered `noindex, nofollow` WITHOUT a
 * canonical link so they can never claim to be another page.
 */
export const PRIVATE_ROUTES = [
  { path: "/admin", file: "admin.html", title: "Admin CMS | Jaimin Umaraniya" },
  { path: "/admin/login", file: "admin-login.html", title: "Admin Login | Jaimin Umaraniya" },
  { path: "/login", file: "login.html", title: "Admin Login | Jaimin Umaraniya" },
  { path: "/style-guide", file: "style-guide.html", title: "Style Guide | Jaimin Umaraniya" },
  { path: "/seed", file: "seed.html", title: "Seed | Jaimin Umaraniya" },
];

/**
 * Legacy paths that were previously advertised (old sitemap / llms.txt).
 * They are permanently redirected to the canonical route so no internal link
 * or bookmark points at a non-canonical URL.
 */
export const LEGACY_REDIRECTS = [
  { from: "/privacy", to: "/privacy-policy" },
  { from: "/refund", to: "/refund-policy" },
];

/** Filename of the crawler-safe SPA shell (no canonical, noindex). */
export const APP_SHELL_FILE = "app-shell.html";

/** Filename of the prerendered 404 page (no canonical, noindex). */
export const NOT_FOUND_FILE = "404.html";

/** Routes that serve dynamic, content-driven pages. */
export const DYNAMIC_ROUTE_PREFIXES = ["/projects/", "/blog/"];

/**
 * Normalizes any incoming path into the canonical route form:
 * strips the query string / hash, guarantees a leading slash and removes
 * trailing slashes (the root stays "/").
 */
export function normalizePath(pathname) {
  if (!pathname) return "/";
  let value = String(pathname).split("#")[0].split("?")[0];
  if (!value.startsWith("/")) value = "/" + value;
  value = value.replace(/\/+$/, "");
  return value || "/";
}

/** Absolute, self-referencing canonical URL for a route path. */
export function canonicalUrl(pathname) {
  return CANONICAL_ORIGIN + normalizePath(pathname);
}

/** Resolves a site-root-relative asset path to an absolute URL. */
export function absoluteUrl(assetPath) {
  if (!assetPath) return CANONICAL_ORIGIN + DEFAULT_OG_IMAGE;
  if (/^https?:\/\//i.test(assetPath)) return assetPath;
  return CANONICAL_ORIGIN + (assetPath.startsWith("/") ? assetPath : "/" + assetPath);
}

/** True when the path is an admin / auth / internal-tooling route. */
export function isPrivatePath(pathname) {
  const path = normalizePath(pathname);
  if (PRIVATE_ROUTES.some((route) => route.path === path)) return true;
  return path.startsWith("/admin/");
}

/** Returns the public route descriptor for a path, or null. */
export function findPublicRoute(pathname) {
  const path = normalizePath(pathname);
  return PUBLIC_ROUTES.find((route) => route.path === path) || null;
}

/** Escapes a value for safe interpolation into HTML text or attributes. */
export function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * Serializes JSON-LD safely: `<` is escaped so a payload can never terminate
 * the surrounding <script> element.
 */
export function toJsonLd(value) {
  return JSON.stringify(value, null, 2)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026");
}

// ─── Head tag construction ───────────────────────────────────────────────────

export const ROBOTS_INDEX =
  "index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1";
export const ROBOTS_NOINDEX = "noindex,nofollow";

export const SEO_HEAD_START = "<!-- SEO_HEAD_START -->";
export const SEO_HEAD_END = "<!-- SEO_HEAD_END -->";

/**
 * Builds the complete, conflict-free head block for a route.
 *
 * When `canonical` is null the page is not indexable: no canonical link and no
 * Open Graph / Twitter tags are emitted at all, so the page can never claim to
 * be another page (this is what the app shell and the 404 page use).
 *
 * Every tag carries `data-rh="true"`. react-helmet-async only manages head
 * tags that are marked with that attribute, so the prerendered tag is adopted
 * (and replaced instead of duplicated) when the React app hydrates — the page
 * therefore always has exactly ONE canonical, in the raw HTML as well as in
 * the hydrated DOM.
 */
export function buildHeadBlock({
  title,
  description,
  keywords,
  canonical,
  ogImage,
  ogImageAlt,
  type = "website",
  robots = ROBOTS_INDEX,
  schema = null,
}) {
  const RH = ' data-rh="true"';
  const lines = [];
  const social = Boolean(canonical);

  lines.push(`    <title>${escapeHtml(title)}</title>`);
  lines.push(`    <meta name="description" content="${escapeHtml(description)}"${RH} />`);
  if (keywords && keywords.length) {
    lines.push(`    <meta name="keywords" content="${escapeHtml(keywords.join(", "))}"${RH} />`);
  }
  lines.push(`    <meta name="author" content="${escapeHtml(SITE_NAME)}"${RH} />`);
  lines.push(`    <meta name="language" content="en"${RH} />`);
  lines.push(`    <meta name="robots" content="${robots}"${RH} />`);

  if (canonical) {
    lines.push(`    <link rel="canonical" href="${canonical}"${RH} />`);
  }

  if (social) {
    const image = ogImage || absoluteUrl(DEFAULT_OG_IMAGE);
    const alt = ogImageAlt || title;

    lines.push(`    <meta property="og:type" content="${type}"${RH} />`);
    lines.push(`    <meta property="og:url" content="${canonical}"${RH} />`);
    lines.push(`    <meta property="og:site_name" content="${escapeHtml(SITE_NAME)}"${RH} />`);
    lines.push(`    <meta property="og:title" content="${escapeHtml(title)}"${RH} />`);
    lines.push(`    <meta property="og:description" content="${escapeHtml(description)}"${RH} />`);
    lines.push(`    <meta property="og:image" content="${image}"${RH} />`);
    lines.push(`    <meta property="og:image:width" content="1200"${RH} />`);
    lines.push(`    <meta property="og:image:height" content="630"${RH} />`);
    lines.push(`    <meta property="og:image:type" content="image/jpeg"${RH} />`);
    lines.push(`    <meta property="og:image:alt" content="${escapeHtml(alt)}"${RH} />`);
    lines.push(`    <meta property="og:locale" content="en_US"${RH} />`);

    lines.push(`    <meta name="twitter:card" content="summary_large_image"${RH} />`);
    lines.push(`    <meta name="twitter:url" content="${canonical}"${RH} />`);
    lines.push(`    <meta name="twitter:site" content="@jaimin_dev"${RH} />`);
    lines.push(`    <meta name="twitter:creator" content="@jaimin_dev"${RH} />`);
    lines.push(`    <meta name="twitter:title" content="${escapeHtml(title)}"${RH} />`);
    lines.push(`    <meta name="twitter:description" content="${escapeHtml(description)}"${RH} />`);
    lines.push(`    <meta name="twitter:image" content="${image}"${RH} />`);
    lines.push(`    <meta name="twitter:image:alt" content="${escapeHtml(alt)}"${RH} />`);
  }

  if (schema) {
    lines.push(`    <script type="application/ld+json"${RH}>\n${toJsonLd(schema)}\n    </script>`);
  }

  return lines.join("\n");
}

/**
 * Replaces the SEO block of a base HTML document with the given head block.
 *
 * The base document ships with `SEO_HEAD_START` / `SEO_HEAD_END` markers, so
 * the entire default block (title + description + OG + Twitter) is removed
 * before the new one is written — a prerendered page can never end up with
 * two titles, two canonicals or two sets of social tags.
 */
export function replaceSeoBlock(html, block) {
  const startIdx = html.indexOf(SEO_HEAD_START);
  const endIdx = html.indexOf(SEO_HEAD_END);

  if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
    return (
      html.slice(0, startIdx + SEO_HEAD_START.length) +
      "\n" +
      block +
      "\n    " +
      html.slice(endIdx)
    );
  }

  // Fallback: strip every SEO managed tag before injecting.
  const fallback = html
    .replace(/<title>[\s\S]*?<\/title>/gi, "")
    .replace(/<meta[^>]+name="(?:description|keywords|author|language|robots)"[^>]*>/gi, "")
    .replace(/<meta[^>]+property="(?:og|twitter):[^"]*"[^>]*>/gi, "")
    .replace(/<meta[^>]+name="twitter:[^"]*"[^>]*>/gi, "")
    .replace(/<link[^>]+rel="canonical"[^>]*>/gi, "")
    .replace(/<script[^>]*type="application\/ld\+json"[^>]*>[\s\S]*?<\/script>/gi, "");
  return fallback.replace("</head>", `${block}\n  </head>`);
}

// ─── Structured data ─────────────────────────────────────────────────────────

export function personNode() {
  return {
    "@type": "Person",
    "@id": `${CANONICAL_ORIGIN}/#person`,
    name: SITE_NAME,
    givenName: "Jaimin",
    familyName: "Umaraniya",
    jobTitle: "Full-Stack Developer & AI Engineer",
    url: `${CANONICAL_ORIGIN}/`,
    image: absoluteUrl(DEFAULT_OG_IMAGE),
    address: {
      "@type": "PostalAddress",
      addressLocality: "Ahmedabad",
      addressRegion: "Gujarat",
      addressCountry: "IN",
    },
    sameAs: ["https://github.com/jaimin2106", "https://linkedin.com/in/jaimin2106"],
  };
}

export function websiteNode() {
  return {
    "@type": "WebSite",
    "@id": `${CANONICAL_ORIGIN}/#website`,
    url: `${CANONICAL_ORIGIN}/`,
    name: SITE_NAME,
    description: "Full-Stack Developer & AI Engineer Portfolio",
    publisher: { "@id": `${CANONICAL_ORIGIN}/#person` },
    inLanguage: "en",
  };
}

export function breadcrumbNode(items) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.label,
      item: item.href,
    })),
  };
}

/** Builds the JSON-LD @graph for a route. */
export function buildSchemaGraph({
  title,
  description,
  canonical,
  schemaType,
  image,
  breadcrumbs = null,
  extra = null,
}) {
  const graph = [personNode(), websiteNode()];

  graph.push({
    "@type": schemaType,
    "@id": `${canonical}#webpage`,
    url: canonical,
    name: title,
    description,
    isPartOf: { "@id": `${CANONICAL_ORIGIN}/#website` },
    about: { "@id": `${CANONICAL_ORIGIN}/#person` },
    inLanguage: "en",
    ...(image ? { primaryImageOfPage: { "@type": "ImageObject", url: image } } : {}),
  });

  if (extra) {
    if (Array.isArray(extra)) graph.push(...extra);
    else graph.push(extra);
  }

  if (breadcrumbs && breadcrumbs.length > 1) {
    graph.push(breadcrumbNode(breadcrumbs));
  }

  return { "@context": "https://schema.org", "@graph": graph };
}
