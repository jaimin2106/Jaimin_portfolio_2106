const fs = require('fs');

let content = fs.readFileSync('c:/Users/JAIMIN/Desktop/JAIMIN-PORTFOLIO/src/pages/ProjectDetail.tsx', 'utf8');

// Replace domain
content = content.replace(/CANONICAL_DOMAIN = "https:\/\/portfoliojaimin\.netlify\.app";/g, 'CANONICAL_DOMAIN = "https://jaiminumaraniya.me";');

// Import NotFound
if (!content.includes('import NotFound from "./NotFound";')) {
  content = content.replace('import SEO from "../components/SEO";', 'import SEO from "../components/SEO";\nimport NotFound from "./NotFound";');
}

// Fix handleShare url
content = content.replace(/const url = \`\$\{CANONICAL_DOMAIN\}\/projects\/\`;/g, 'const url = `${CANONICAL_DOMAIN}/projects/${project.slug || project.id}`;');

// Fix 404 behavior
const notFoundStateStr = `  if (!project)
    return (
      <div className="pt-32 text-center h-screen flex items-center justify-center font-display text-xl font-bold">
        Project not found.
      </div>
    );`;
content = content.replace(notFoundStateStr, '  if (!project) return <NotFound />;');

fs.writeFileSync('c:/Users/JAIMIN/Desktop/JAIMIN-PORTFOLIO/src/pages/ProjectDetail.tsx', content);
console.log('ProjectDetail.tsx updated!');
