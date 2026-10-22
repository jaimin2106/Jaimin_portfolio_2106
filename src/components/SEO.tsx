import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';
import { useSettings } from '../contexts/SettingsContext';
import {
  CANONICAL_ORIGIN,
  DEFAULT_KEYWORDS,
  DEFAULT_OG_IMAGE,
  ROBOTS_INDEX,
  ROBOTS_NOINDEX,
  canonicalUrl,
  isPrivatePath,
} from '../data/site-seo.js';

const SITE_NAME = 'Jaimin Umaraniya';


interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string[];
  ogImage?: string;
  ogImageWidth?: number;
  ogImageHeight?: number;
  ogImageAlt?: string;
  type?: 'website' | 'article' | 'profile';
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  schema?: Record<string, any> | Record<string, any>[];
  noindex?: boolean;
  twitterHandle?: string;
  readingTime?: string;
  category?: string;
  tags?: string[];
}

export default function SEO({
  title,
  description,
  keywords,
  ogImage,
  ogImageWidth = 1200,
  ogImageHeight = 630,
  ogImageAlt,
  type = "website",
  author,
  publishedTime,
  modifiedTime,
  schema,
  noindex = false,
  twitterHandle = "@jaimin_dev",
  readingTime,
  category,
  tags = [],
}: SEOProps) {
  // ── Hooks must always run in the same order ──────────────────────────
  const location = useLocation();
  const { settings } = useSettings();

  // ── Derived values ────────────────────────────────────────────────────
  const finalDescription = description
    || settings.seoDescription
    || "Jaimin Umaraniya is a Full-Stack Developer and AI Engineer specializing in React, Next.js, Node.js, AI-powered applications, SaaS architecture, technical SEO, and high-performance web experiences.";

  const finalKeywords = keywords
    || (settings.seoKeywords
      ? settings.seoKeywords.split(',').map((k: string) => k.trim())
      : DEFAULT_KEYWORDS);

  const finalOgImage = ogImage || settings.ogImage || DEFAULT_OG_IMAGE;
  const finalAuthor = author || settings.siteName || "Jaimin Umaraniya";
  const finalTwitterHandle = twitterHandle || "@jaimin_dev";

<<<<<<< HEAD
  const canonicalPath = location.pathname.replace(/\/$/, '') || '/';
  const currentUrl = `${CANONICAL_DOMAIN}${canonicalPath === '/' ? '/' : canonicalPath}`;
=======
  // The canonical URL is ALWAYS derived from the production origin, never from
  // the current host, so a preview deployment still advertises the canonical
  // production URL.
  const currentUrl = canonicalUrl(location.pathname);

  // Private routes (admin / auth / tooling) must never be indexable and must
  // never claim a canonical URL.
  const isPrivate = noindex || isPrivatePath(location.pathname);

>>>>>>> eeea694 (canonical issue fix)

  const SUFFIX = ` | ${SITE_NAME}`;
  const fullTitle = !title
    ? `${SITE_NAME} | Full-Stack Developer & AI Engineer`
    : title.includes(SITE_NAME)
      ? title
      : `${title}${SUFFIX}`;

  const isBase64 = finalOgImage?.startsWith('data:');
<<<<<<< HEAD
  const safeOgImage = isBase64 || finalOgImage?.startsWith('http://') ? '/OG.jpg' : (finalOgImage || '/OG.jpg');
  const absoluteOgImage = safeOgImage.startsWith('https://')
=======
  const safeOgImage = isBase64 ? DEFAULT_OG_IMAGE : (finalOgImage || DEFAULT_OG_IMAGE);
  const absoluteOgImage = safeOgImage.startsWith('http')
>>>>>>> eeea694 (canonical issue fix)
    ? safeOgImage
    : `${CANONICAL_ORIGIN}${safeOgImage.startsWith('/') ? '' : '/'}${safeOgImage}`;

  const imageAlt = ogImageAlt || fullTitle;

  const pageId = `${currentUrl}#webpage`;
  const baseSchema: any = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Person",
        "@id": `${CANONICAL_DOMAIN}/#person`,
        "name": SITE_NAME,
        "url": CANONICAL_DOMAIN,
        "image": `${CANONICAL_DOMAIN}/OG.jpg`,
        "jobTitle": "Full-Stack Developer & AI Engineer",
        "address": {
          "@type": "PostalAddress",
          "addressLocality": "Ahmedabad",
          "addressRegion": "Gujarat",
          "addressCountry": "IN"
        },
        "knowsAbout": ["React", "Next.js", "TypeScript", "Firebase", "Node.js", "AI Engineering", "Web Performance", "Full Stack Development"],
        "sameAs": [
          "https://github.com/jaimin2106",
          "https://linkedin.com/in/jaimin2106"
        ]
      },
      {
        "@type": "WebSite",
        "@id": `${CANONICAL_ORIGIN}/#website`,
        "url": CANONICAL_ORIGIN,
        "name": SITE_NAME,
        "description": "Full-Stack Developer & AI Engineer Portfolio",
<<<<<<< HEAD
        "publisher": { "@id": `${CANONICAL_DOMAIN}/#person` }
=======
        "publisher": {
          "@type": "Person",
          "@id": `${CANONICAL_ORIGIN}/#person`,
          "name": SITE_NAME
        }
>>>>>>> eeea694 (canonical issue fix)
      }
    ] as any[]
  };

<<<<<<< HEAD
  const extraSchemas = schema ? (Array.isArray(schema) ? schema : [schema]) : [];
  if (!extraSchemas.some((entry) => entry["@id"] === pageId)) {
    baseSchema["@graph"].push({
      "@type": "WebPage",
      "@id": pageId,
      "url": currentUrl,
      "name": fullTitle,
      "description": finalDescription,
      "isPartOf": { "@id": `${CANONICAL_DOMAIN}/#website` }
    });
  }
=======
>>>>>>> eeea694 (canonical issue fix)

  if (schema) {
    baseSchema["@graph"].push(...extraSchemas);
  }

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={finalDescription} />
      <meta name="keywords" content={finalKeywords.join(', ')} />
      <meta name="author" content={finalAuthor} />
      <meta name="language" content="en" />
      <meta name="theme-color" content="#E85D04" />
      <meta
        name="robots"
        content={isPrivate ? ROBOTS_NOINDEX : ROBOTS_INDEX}
      />

      {/* Private routes never claim a canonical URL */}
      {!isPrivate && <link rel="canonical" href={currentUrl} />}


      {/* Open Graph */}
      {!isPrivate && <>
        <meta property="og:type" content={type} />
        <meta property="og:url" content={currentUrl} />
        <meta property="og:title" content={fullTitle} />
        <meta property="og:description" content={finalDescription} />
        <meta property="og:image" content={absoluteOgImage} />
        <meta property="og:image:width" content={String(ogImageWidth)} />
        <meta property="og:image:height" content={String(ogImageHeight)} />
        <meta property="og:image:alt" content={imageAlt} />
        <meta property="og:image:type" content="image/jpeg" />
        <meta property="og:site_name" content={SITE_NAME} />
        <meta property="og:locale" content="en_US" />

        {/* Twitter / X */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content={currentUrl} />
        <meta name="twitter:title" content={fullTitle} />
        <meta name="twitter:description" content={finalDescription} />
        <meta name="twitter:image" content={absoluteOgImage} />
        <meta name="twitter:image:alt" content={imageAlt} />
        <meta name="twitter:creator" content={finalTwitterHandle} />
        <meta name="twitter:site" content={finalTwitterHandle} />
        {readingTime && <meta name="twitter:label1" content="Reading time" />}
        {readingTime && <meta name="twitter:data1" content={readingTime} />}
        {category && <meta name="twitter:label2" content="Category" />}
        {category && <meta name="twitter:data2" content={category} />}
      </>}


      {/* Article-specific metadata */}
      {type === 'article' && publishedTime && (
        <meta property="article:published_time" content={publishedTime} />
      )}
      {type === 'article' && modifiedTime && (
        <meta property="article:modified_time" content={modifiedTime} />
      )}
      {type === 'article' && author && (
        <meta property="article:author" content={finalAuthor} />
      )}
      {type === 'article' && category && (
        <meta property="article:section" content={category} />
      )}
      {type === 'article' && tags.map((tag) => (
        <meta key={tag} property="article:tag" content={tag} />
      ))}

      {/* Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(baseSchema).replace(/</g, '\\u003c')}
      </script>
    </Helmet>
  );
}
