const fs = require('fs');
const pHero = 'c:/Users/JAIMIN/Desktop/JAIMIN-PORTFOLIO/src/components/Hero.tsx';
let dHero = fs.readFileSync(pHero, 'utf8');

dHero = dHero.replace(
  /headline: "AI-Driven Digital Mastery"/,
  'headline: "Full-Stack Developer & AI Engineer"'
);

dHero = dHero.replace(
  /subtitle:\s+"Transforming businesses through cutting-edge artificial intelligence, data analytics, and seamless digital solutions that drive growth, efficiency, and competitive advantage\."/,
  'subtitle: "I build AI-powered web applications, scalable SaaS products, and high-performance digital experiences using React, Next.js, Node.js, and modern web architecture. My work combines full-stack engineering, AI integration, technical SEO, and performance-focused development to turn complex ideas into reliable products."'
);

dHero = dHero.replace(
  />\s+Explore Projects\s+<\/a>/,
  '>Explore My Projects</a>'
);
dHero = dHero.replace(
  />\s+Read Journal\s+<\/Link>/,
  '>Read My Articles</Link>'
);

fs.writeFileSync(pHero, dHero);
console.log("Hero component updated");
