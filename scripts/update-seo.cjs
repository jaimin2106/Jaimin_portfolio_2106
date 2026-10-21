const fs = require('fs');

const pSEO = 'c:/Users/JAIMIN/Desktop/JAIMIN-PORTFOLIO/src/components/SEO.tsx';
let dSEO = fs.readFileSync(pSEO, 'utf8');

dSEO = dSEO.replace(
  /description = "Senior Full Stack Developer & AI Engineer based in Ahmedabad, India. Specializing in React, Next\.js, TypeScript, Firebase, and AI integrations\."/,
  'description = "Jaimin Umaraniya is a Full-Stack Developer and AI Engineer specializing in React, Next.js, Node.js, AI-powered applications, SaaS architecture, technical SEO, and high-performance web experiences."'
);

dSEO = dSEO.replace(
  /keywords = \["Jaimin Umaraniya", "Full Stack Developer", "React Developer", "Next\.js Developer", "TypeScript", "Firebase", "AI Developer", "Ahmedabad"\]/,
  'keywords = ["Jaimin Umaraniya", "Full-Stack Developer", "AI Engineer", "React", "Next.js", "Node.js", "TypeScript", "SaaS Architecture", "Technical SEO"]'
);

dSEO = dSEO.replace(
  /description": "Senior Full Stack Developer & AI Engineer Portfolio"/,
  'description": "Full-Stack Developer & AI Engineer Portfolio"'
);

dSEO = dSEO.replace(
  /const fullTitle = !title\s+\?\s+`\$\{SITE_NAME\} \| Senior Full Stack & AI Developer`\s+:\s+title\.includes\(SITE_NAME\)\s+\?\s+title\s+:\s+`\$\{title\}\$\{SUFFIX\}`;/,
  'const fullTitle = !title ? `${SITE_NAME} | Full-Stack Developer & AI Engineer` : title.includes(SITE_NAME) ? title : `${title}${SUFFIX}`;'
);

fs.writeFileSync(pSEO, dSEO);

const pHome = 'c:/Users/JAIMIN/Desktop/JAIMIN-PORTFOLIO/src/pages/Home.tsx';
let dHome = fs.readFileSync(pHome, 'utf8');

dHome = dHome.replace(
  /title="Jaimin Umaraniya \| Senior Full Stack & AI Developer Portfolio"/,
  'title="Jaimin Umaraniya | Full-Stack Developer & AI Engineer"'
);

dHome = dHome.replace(
  /description="Explore the portfolio of Jaimin Umaraniya, a Senior Full Stack Developer from Ahmedabad specializing in React, Next\.js, Firebase, and AI Discoverability\. View my latest case studies and technical insights\."/,
  'description="Jaimin Umaraniya is a Full-Stack Developer and AI Engineer specializing in React, Next.js, Node.js, AI-powered applications, SaaS architecture, technical SEO, and high-performance web experiences."'
);

dHome = dHome.replace(
  /description": "Senior Full Stack Developer & AI Engineer based in Ahmedabad, India\. Specializing in React, Next\.js, TypeScript, Firebase, and AI integrations\."/,
  'description": "Jaimin Umaraniya is a Full-Stack Developer and AI Engineer specializing in React, Next.js, Node.js, AI-powered applications, SaaS architecture, technical SEO, and high-performance web experiences."'
);

dHome = dHome.replace(
  /jobTitle": "Senior Full Stack Developer & AI Engineer"/,
  'jobTitle": "Full-Stack Developer & AI Engineer"'
);

dHome = dHome.replace(
  /description": "Explore the portfolio of Jaimin Umaraniya, a Senior Full Stack Developer from Ahmedabad\."/,
  'description": "Jaimin Umaraniya is a Full-Stack Developer and AI Engineer specializing in React, Next.js, Node.js, AI-powered applications, SaaS architecture, technical SEO, and high-performance web experiences."'
);

dHome = dHome.replace(
  /name": "Jaimin Umaraniya \| Senior Full Stack & AI Developer Portfolio"/,
  'name": "Jaimin Umaraniya | Full-Stack Developer & AI Engineer"'
);

fs.writeFileSync(pHome, dHome);
console.log("SEO and Home metadata updated");
