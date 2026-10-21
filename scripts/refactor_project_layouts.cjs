const fs = require('fs');

let content = fs.readFileSync('c:/Users/JAIMIN/Desktop/JAIMIN-PORTFOLIO/src/components/projects/ProjectLayouts.tsx', 'utf8');

if (!content.includes('export const getProjectUrl')) {
  // Add getProjectUrl helper
  content = content.replace('// --- Helpers ---', '// --- Helpers ---\n\nexport const getProjectUrl = (project: any) => `/projects/${project.slug || project.id}`;');
}

// Replace all broken links
content = content.replace(/to=\{\`\/projects\/\`\}/g, 'to={getProjectUrl(project)}');

// Fix ARIA labels in FeaturedCard
content = content.replace(
  /aria-label="Visit Live"/g,
  'aria-label={`Visit live site for ${project.title}`}'
);
content = content.replace(
  /aria-label="View Source"/g,
  'aria-label={`View source code for ${project.title}`}'
);

// Add ARIA labels to "Read Case Study" style links in FeaturedCard
content = content.replace(
  />\s*Read Case Study\s*<\/Link>/g,
  ' aria-label={`Read case study for ${project.title}`}>\n            Read Case Study\n          </Link>'
);

// In SplitCard
content = content.replace(
  />\s*Explore Architecture <ArrowUpRight className="w-4 h-4" \/>\s*<\/Link>/g,
  ' aria-label={`Explore architecture for ${project.title}`}>\n          Explore Architecture <ArrowUpRight className="w-4 h-4" />\n        </Link>'
);

// In GridCard (Arrow button)
// The Arrow button in GridCard is just a link wrapping an icon, very inaccessible.
content = content.replace(
  /className="absolute inset-0 z-10 flex items-center justify-center opacity-0 group-hover\/card:opacity-100 transition-opacity duration-300"/g,
  'className="absolute inset-0 z-10 flex items-center justify-center opacity-0 group-hover/card:opacity-100 transition-opacity duration-300" aria-label={`View details for ${project.title}`}'
);
// GridCard Live link
content = content.replace(
  /className="text-xs font-mono font-medium uppercase tracking-widest text-gray-400 hover:text-black transition-colors flex items-center gap-1">/g,
  'className="text-xs font-mono font-medium uppercase tracking-widest text-gray-400 hover:text-black transition-colors flex items-center gap-1" aria-label={`Live demo for ${project.title}`}>'
);

// In StoryCard
content = content.replace(
  />\s*Read the full story\s*<\/Link>/g,
  ' aria-label={`Read the full story for ${project.title}`}>\n          Read the full story\n        </Link>'
);

// In CompactCard
content = content.replace(
  /className="group block border-b border-black\/5 hover:border-black\/20 transition-colors">/g,
  'className="group block border-b border-black/5 hover:border-black/20 transition-colors" aria-label={`View project ${project.title}`}>\n'
);


fs.writeFileSync('c:/Users/JAIMIN/Desktop/JAIMIN-PORTFOLIO/src/components/projects/ProjectLayouts.tsx', content);
console.log('ProjectLayouts.tsx updated!');
