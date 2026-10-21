const fs = require('fs');
let content = fs.readFileSync('src/components/CaseStudies.tsx', 'utf8');

if (!content.includes('parseTags')) {
  content = content.replace('import { formatTechName } from "../lib/format";', 'import { formatTechName, parseTags } from "../lib/format";');
  content = content.replace(
    /\{\(study\.techStack \|\| study\.skills \|\| \[\]\)\.slice/g,
    '{(parseTags(study.techStack).length > 0 ? parseTags(study.techStack) : parseTags(study.skills)).slice'
  );
  fs.writeFileSync('src/components/CaseStudies.tsx', content);
}
