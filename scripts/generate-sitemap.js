import fs from 'fs';
import path from 'path';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, initializeFirestore } from 'firebase/firestore';

const firebaseConfig = {
  projectId: "astute-abbey-p1wkv",
  appId: "1:509171019192:web:4aba69e3e6ad580df2334d",
  apiKey: "AIzaSyAPch8N_4oxiFv8iKhIJ2zTVgbTGt32nHI",
  authDomain: "astute-abbey-p1wkv.firebaseapp.com",
  storageBucket: "astute-abbey-p1wkv.firebasestorage.app",
  messagingSenderId: "509171019192"
};

const app = initializeApp(firebaseConfig);
// No persistent cache â€” this runs in Node.js during build, not a browser
const db = initializeFirestore(app, {}, "ai-studio-72db9056-9c78-47ef-8e14-18be539b546c");

const BASE_URL = "https://jaiminumaraniya.me";

async function generateSitemap() {
  console.log("Generating dynamic sitemap...");
  const today = new Date().toISOString().split('T')[0];

  // Static routes â€” must exactly match the routes defined in src/App.tsx
  // /about does NOT exist as a route â€” excluded
  // /privacy-policy and /refund-policy are the correct route paths (not /privacy, /refund)
  const routes = [
    { url: "/",                changefreq: "daily",   priority: "1.0", lastmod: today },
    { url: "/projects",        changefreq: "weekly",  priority: "0.9", lastmod: today },
    { url: "/blog",            changefreq: "weekly",  priority: "0.9", lastmod: today },
    { url: "/contact",         changefreq: "monthly", priority: "0.8", lastmod: today },
    { url: "/privacy-policy",  changefreq: "yearly",  priority: "0.4", lastmod: today },
    { url: "/refund-policy",   changefreq: "yearly",  priority: "0.3", lastmod: today },
  ];

  let projectCount = 0;
  let blogCount = 0;

  try {
    // â”€â”€ Projects â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    console.log("Fetching projects from Firestore...");
    const projectsSnapshot = await getDocs(collection(db, 'projects'));
    projectsSnapshot.forEach((doc) => {
      const data = doc.data();
      const id = doc.id;
      // Skip unpublished / draft projects
      if (data.status && data.status !== "Published") return;
      const lastmod = data.updatedAt?.toDate?.()?.toISOString().split('T')[0] || today;
      routes.push({ url: `/projects/${id}`, changefreq: "monthly", priority: "0.7", lastmod });
      projectCount++;
    });

    // â”€â”€ Blog posts â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    console.log("Fetching blog posts from Firestore...");
    const blogsSnapshot = await getDocs(collection(db, 'blogs'));
    blogsSnapshot.forEach((doc) => {
      const data = doc.data();
      // Only include published posts
      if (data.status !== "Published") return;
      const slug = data.slug || doc.id;
      const lastmod = data.updatedAt?.toDate?.()?.toISOString().split('T')[0] || today;
      routes.push({ url: `/blog/${slug}`, changefreq: "weekly", priority: "0.8", lastmod });
      blogCount++;
    });

  } catch (e) {
    console.error("Error fetching Firestore data:", e.message);
    console.log("Proceeding with static-only sitemap.");
  }

  // Build XML â€” no leading whitespace on the opening tag (required for valid XML)
  const xml = [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
    ...routes.map(r => [
      `  <url>`,
      `    <loc>${BASE_URL}${r.url}</loc>`,
      `    <lastmod>${r.lastmod}</lastmod>`,
      `    <changefreq>${r.changefreq}</changefreq>`,
      `    <priority>${r.priority}</priority>`,
      `  </url>`,
    ].join('\n')),
    `</urlset>`,
  ].join('\n');

  const outPath = path.join(process.cwd(), 'public', 'sitemap.xml');
  fs.writeFileSync(outPath, xml, 'utf-8');

  console.log(`âœ“ sitemap.xml written â†’ ${outPath}`);
  console.log(`  Static pages : ${routes.length - projectCount - blogCount}`);
  console.log(`  Projects     : ${projectCount}`);
  console.log(`  Blog posts   : ${blogCount}`);
  console.log(`  Total URLs   : ${routes.length}`);

  process.exit(0);
}

generateSitemap();

