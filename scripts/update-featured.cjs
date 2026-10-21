const fs = require('fs');
const pFeat = 'c:/Users/JAIMIN/Desktop/JAIMIN-PORTFOLIO/src/components/FeaturedProject.tsx';
let dFeat = fs.readFileSync(pFeat, 'utf8');

dFeat = dFeat.replace(
  /to=\{`\/projects\/`\}/g,
  'to={`/projects/${project.slug || project.id}`}'
);

dFeat = dFeat.replace(
  /<span className="font-mono text-sm tracking-wider uppercase text-gray-500 font-medium mb-3 sm:mb-4 block">.*?<\/span>/s,
  '<span className="font-mono text-sm tracking-wider uppercase text-gray-500 font-medium mb-3 sm:mb-4 block">FEATURED PROJECT</span>'
);

fs.writeFileSync(pFeat, dFeat);
console.log("FeaturedProject.tsx updated");
