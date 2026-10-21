const fs = require('fs');
const path = 'c:/Users/JAIMIN/Desktop/JAIMIN-PORTFOLIO/scripts/prerender.js';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(
  'function injectSEO(html, { title, description, keywords, ogImage, h1, content, schema }) {',
  'function injectSEO(html, { title, description, keywords, ogImage, h1, content, schema, canonicalUrl }) {'
);

content = content.replace(
  '// Append extra head tags (keywords, JSON-LD)\n  let headAdditions = \'\';\n  if (keywords) {',
  '// Append extra head tags (keywords, JSON-LD, canonical)\n  let headAdditions = \'\';\n  if (canonicalUrl) {\n    headAdditions += `  <link rel="canonical" href="${canonicalUrl}" />\\n`;\n  }\n  if (keywords) {'
);

content = content.replace(
  'h1: "Jaimin Umaraniya - Senior Full Stack & AI Developer",\n      schema: {',
  'h1: "Jaimin Umaraniya - Senior Full Stack & AI Developer",\n      canonicalUrl: BASE_URL,\n      schema: {'
);

content = content.replace(
  'h1: "Works and Projects",\n      schema: {',
  'h1: "Works and Projects",\n      canonicalUrl: `${BASE_URL}/projects`,\n      schema: {'
);

content = content.replace(
  'h1: "Technical Blog & Articles",\n      schema: {',
  'h1: "Technical Blog & Articles",\n      canonicalUrl: `${BASE_URL}/blog`,\n      schema: {'
);

content = content.replace(
  'content: project.fullDescription || project.challenges || project.content,\n        schema: {',
  'content: project.fullDescription || project.challenges || project.content,\n        canonicalUrl: `${BASE_URL}/projects/${project.id}`,\n        schema: {'
);

content = content.replace(
  'content: blog.content,\n        schema: {',
  'content: blog.content,\n        canonicalUrl: `${BASE_URL}/blog/${slug}`,\n        schema: {'
);

fs.writeFileSync(path, content, 'utf8');
console.log('Successfully added canonical urls');
