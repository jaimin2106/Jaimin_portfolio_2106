const fs = require('fs');
const pCase = 'c:/Users/JAIMIN/Desktop/JAIMIN-PORTFOLIO/src/components/CaseStudies.tsx';
let dCase = fs.readFileSync(pCase, 'utf8');

dCase = dCase.replace(
  /text-white">PROJECTS<\/h2>/,
  'text-white">SELECTED PROJECTS</h2>'
);

dCase = dCase.replace(
  /to=\{`\/projects\/`\}/g,
  'to={`/projects/${study.slug || study.id}`}'
);

dCase = dCase.replace(
  /aria-label="View Project"/g,
  'aria-label={`Read case study for ${study.title}`}'
);

fs.writeFileSync(pCase, dCase);
console.log("CaseStudies.tsx updated");
