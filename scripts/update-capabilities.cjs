const fs = require('fs');
const pCap = 'c:/Users/JAIMIN/Desktop/JAIMIN-PORTFOLIO/src/components/Capabilities.tsx';
let dCap = fs.readFileSync(pCap, 'utf8');

dCap = dCap.replace(
  /return \[[\s\S]*?\];/,
  `return [
        {
          id: "1",
          title: "Full-Stack Web Development",
          iconName: "Code2",
          tech: "React, Next.js, Node.js, TypeScript",
          desc: "Modern web applications built with React, Next.js, TypeScript, Node.js, and scalable backend architectures."
        },
        {
          id: "2",
          title: "AI-Powered Applications",
          iconName: "Sparkles",
          tech: "LLMs, AI APIs, Workflows",
          desc: "AI features and intelligent workflows integrated into real products using modern APIs, LLMs, and application architecture."
        },
        {
          id: "3",
          title: "SaaS & Web Architecture",
          iconName: "Database",
          tech: "PostgreSQL, Supabase, Firebase",
          desc: "Scalable application architectures designed around maintainability, performance, data management, authentication, and reliable product workflows."
        },
        {
          id: "4",
          title: "Technical SEO & AI Search",
          iconName: "Search",
          tech: "Next.js, Schema, Performance",
          desc: "Technical SEO, JavaScript SEO, structured data, performance optimization, and AI search optimization for modern web applications."
        }
      ];`
);

dCap = dCap.replace(
  /title: "CAPABILITIES",\s*subtitle: "Here's how I help businesses bring their ideas to life through robust engineering\."/,
  `title: "What I Build", subtitle: "Here's how I help businesses bring their ideas to life through robust engineering."`
);

dCap = dCap.replace(
  /\{config\.title \|\| "CAPABILITIES"\}/,
  '{config.title || "What I Build"}'
);

fs.writeFileSync(pCap, dCap);
console.log("Capabilities.tsx updated");
