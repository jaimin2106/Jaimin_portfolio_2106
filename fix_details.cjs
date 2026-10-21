const fs = require('fs');

function fixPD() {
  let content = fs.readFileSync('src/pages/ProjectDetail.tsx', 'utf8');
  if (!content.includes('parseTags')) {
    content = content.replace('import { formatTechName } from "../lib/format";', 'import { formatTechName, parseTags } from "../lib/format";');
    content = content.replace(/project\.techStack\?\.join/g, 'parseTags(project.techStack).join');
    content = content.replace(/\|\| project\.techStack \|\|/g, '|| (parseTags(project.techStack).length > 0 ? parseTags(project.techStack) : null) ||');
    content = content.replace(/\{project\.techStack && project\.techStack\.length > 0 && \(/g, '{parseTags(project.techStack).length > 0 && (');
    content = content.replace(/\{project\.techStack\.map/g, '{parseTags(project.techStack).map');
    fs.writeFileSync('src/pages/ProjectDetail.tsx', content);
  }
}

function fixBD() {
  let content = fs.readFileSync('src/pages/BlogDetail.tsx', 'utf8');
  if (!content.includes('parseTags')) {
    content = content.replace('import { formatTechName } from "../lib/format";', 'import { formatTechName, parseTags } from "../lib/format";');
    content = content.replace(/\|\| post\.tags \|\|/g, '|| (parseTags(post.tags).length > 0 ? parseTags(post.tags) : null) ||');
    content = content.replace(/\{post\.tags && post\.tags\.length > 0 && \(/g, '{parseTags(post.tags).length > 0 && (');
    content = content.replace(/\{post\.tags\.map/g, '{parseTags(post.tags).map');
    fs.writeFileSync('src/pages/BlogDetail.tsx', content);
  }
}

fixPD();
fixBD();
