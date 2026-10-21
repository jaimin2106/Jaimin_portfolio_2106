const fs = require('fs');

function fixFP() {
  let content = fs.readFileSync('src/components/FeaturedProject.tsx', 'utf8');
  if (!content.includes('parseTags')) {
    content = content.replace('import { Link } from "react-router-dom";', 'import { Link } from "react-router-dom";\nimport { parseTags } from "../lib/format";');
    content = content.replace(/\{project\.skills\.slice/g, '{parseTags(project.skills).slice');
    content = content.replace(/\{project\.skills\?\.slice/g, '{parseTags(project.skills).slice');
    fs.writeFileSync('src/components/FeaturedProject.tsx', content);
  }
}

function fixProjects() {
  let content = fs.readFileSync('src/pages/Projects.tsx', 'utf8');
  if (!content.includes('parseTags')) {
    content = content.replace('import { formatTechName } from "../lib/format";', 'import { formatTechName, parseTags } from "../lib/format";');
    content = content.replace(/\{\(project\.techStack \|\| \[\]\)\.slice/g, '{parseTags(project.techStack).slice');
    fs.writeFileSync('src/pages/Projects.tsx', content);
  }
}

fixFP();
fixProjects();
