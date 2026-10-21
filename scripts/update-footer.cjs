const fs = require('fs');
const pFooter = 'c:/Users/JAIMIN/Desktop/JAIMIN-PORTFOLIO/src/components/Footer.tsx';
let dFooter = fs.readFileSync(pFooter, 'utf8');

dFooter = dFooter.replace(
  /A digital craftsman specializing in full-stack engineering, scalable architectures, and delivering premium web experiences\./,
  'Full-Stack Developer & AI Engineer specializing in React, Next.js, Node.js, AI integrations, SaaS architecture, technical SEO, and high-performance web experiences.'
);

fs.writeFileSync(pFooter, dFooter);
console.log("Footer.tsx updated");
