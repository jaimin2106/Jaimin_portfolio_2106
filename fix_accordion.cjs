const fs = require('fs');

function fix(file) {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/<Accordion type="single" collapsible className="w-full">/g, '<Accordion className="w-full">');
  fs.writeFileSync(file, content);
}

fix('src/pages/BlogDetail.tsx');
fix('src/pages/ProjectDetail.tsx');
