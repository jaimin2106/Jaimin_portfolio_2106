import fs from 'fs';
import path from 'path';

const PUBLIC_URL = 'https://jaimin-premium-full-stack-portfolio-509171019192.us-west1.run.app';

if (!fs.existsSync('public')) {
  fs.mkdirSync('public');
}

function generateRobotsTxt() {
  const content = `User-agent: *
Allow: /
Disallow: /admin
Disallow: /admin/
Disallow: /login

Sitemap: ${PUBLIC_URL}/sitemap.xml
`;
  fs.writeFileSync(path.resolve('public', 'robots.txt'), content);
  console.log('✅ Generated robots.txt');
}

async function generateSitemap() {
  let routes = [
    { url: '/', changefreq: 'daily', priority: '1.0' },
    { url: '/projects', changefreq: 'weekly', priority: '0.9' },
    { url: '/blog', changefreq: 'weekly', priority: '0.9' },
    { url: '/contact', changefreq: 'monthly', priority: '0.8' },
    { url: '/about', changefreq: 'monthly', priority: '0.8' }
  ];

  try {
    const projectsRes = await fetch('https://firestore.googleapis.com/v1/projects/astute-abbey-p1wkv/databases/ai-studio-72db9056-9c78-47ef-8e14-18be539b546c/documents/projects');
    if (projectsRes.ok) {
      const data = await projectsRes.json();
      if (data.documents) {
        data.documents.forEach((doc) => {
          const id = doc.name.split('/').pop();
          const updatedAt = doc.fields?.updatedAt?.timestampValue || new Date().toISOString();
          routes.push({ url: `/projects/${id}`, changefreq: 'monthly', priority: '0.7', lastmod: updatedAt });
        });
      }
    }

    const blogsRes = await fetch('https://firestore.googleapis.com/v1/projects/astute-abbey-p1wkv/databases/ai-studio-72db9056-9c78-47ef-8e14-18be539b546c/documents/blogs');
    if (blogsRes.ok) {
      const data = await blogsRes.json();
      if (data.documents) {
        data.documents.forEach((doc) => {
          const fields = doc.fields || {};
          const slug = fields.slug?.stringValue || doc.name.split('/').pop();
          const updatedAt = fields.updatedAt?.timestampValue || new Date().toISOString();
          if (fields.status?.stringValue === 'Published') {
            routes.push({ url: `/blog/${slug}`, changefreq: 'weekly', priority: '0.8', lastmod: updatedAt });
          }
        });
      }
    }
  } catch (e) {
    console.error('❌ Failed to fetch dynamic routes for sitemap:', e.message);
  }

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${routes.map(route => `  <url>
    <loc>${PUBLIC_URL}${route.url}</loc>
    ${route.lastmod ? `<lastmod>${route.lastmod}</lastmod>` : ''}
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

  fs.writeFileSync(path.resolve('public', 'sitemap.xml'), sitemap);
  console.log('✅ Generated dynamic sitemap.xml');
}

async function injectSEO() {
  try {
    const res = await fetch('https://firestore.googleapis.com/v1/projects/astute-abbey-p1wkv/databases/ai-studio-72db9056-9c78-47ef-8e14-18be539b546c/documents/settings/global');
    if (!res.ok) throw new Error('Failed to fetch settings');
    
    const data = await res.json();
    const fields = data.fields || {};
    
    const seoTitle = fields.seoTitle?.stringValue || 'My Google AI Studio App';
    const seoDescription = fields.seoDescription?.stringValue || '';
    const seoKeywords = fields.seoKeywords?.stringValue || '';
    const gscVerification = fields.gscVerification?.stringValue || '';
    const favicon = fields.favicon?.stringValue || '';

    let indexPath = path.resolve('index.html');
    let html = fs.readFileSync(indexPath, 'utf-8');

    // Replace Title
    html = html.replace(/<title>.*?<\/title>/, `<title>${seoTitle}</title>`);

    // Prepare new meta tags
    let metaTags = [];
    if (seoDescription) metaTags.push(`<meta name="description" content="${seoDescription}">`);
    if (seoKeywords) metaTags.push(`<meta name="keywords" content="${seoKeywords}">`);
    if (gscVerification) {
        metaTags.push(gscVerification);
    }
    if (favicon) {
      html = html.replace(/<link rel="icon".*?>/, '');
      metaTags.push(`<link rel="icon" href="${favicon}">`);
    }

    const markerStart = '<!-- SEO_INJECT_START -->';
    const markerEnd = '<!-- SEO_INJECT_END -->';
    const injectedContent = `\n${markerStart}\n${metaTags.join('\n')}\n${markerEnd}\n`;

    if (html.includes(markerStart)) {
      html = html.replace(new RegExp(`${markerStart}[\\s\\S]*?${markerEnd}`), injectedContent.trim());
    } else {
      html = html.replace('</head>', `${injectedContent}</head>`);
    }

    fs.writeFileSync(indexPath, html);
    console.log('✅ Injected SEO tags into index.html');

  } catch (e) {
    console.error('❌ Failed to inject SEO:', e.message);
  }
}

async function main() {
  generateRobotsTxt();
  await generateSitemap();
  await injectSEO();
}

main();
