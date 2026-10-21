const fs = require('fs');

let content = fs.readFileSync('c:/Users/JAIMIN/Desktop/JAIMIN-PORTFOLIO/src/pages/Home.tsx', 'utf8');

if (!content.includes('import { ScrollReveal }')) {
  content = content.replace('import Hero from "../components/Hero";', 'import Hero from "../components/Hero";\nimport { ScrollReveal } from "../components/ui/ScrollReveal";');
}

// Wrap FeaturedProject
content = content.replace('<FeaturedProject />', '<ScrollReveal>\n        <FeaturedProject />\n      </ScrollReveal>');

// Wrap Stats
content = content.replace('<Stats />', '<ScrollReveal delay={0.1}>\n          <Stats />\n        </ScrollReveal>');

// Wrap CaseStudies
content = content.replace('<CaseStudies />', '<ScrollReveal>\n          <CaseStudies />\n        </ScrollReveal>');

// Wrap Capabilities
content = content.replace('<Capabilities />', '<ScrollReveal>\n          <Capabilities />\n        </ScrollReveal>');

// Wrap Journal
content = content.replace('<Journal />', '<ScrollReveal>\n          <Journal />\n        </ScrollReveal>');

// Wrap Testimonials
content = content.replace('<Testimonials />', '<ScrollReveal>\n          <Testimonials />\n        </ScrollReveal>');

// Wrap FAQ
content = content.replace('<FAQ />', '<ScrollReveal>\n          <FAQ />\n        </ScrollReveal>');

// Wrap Contact
content = content.replace('<Contact />', '<ScrollReveal delay={0.1}>\n          <Contact />\n        </ScrollReveal>');

fs.writeFileSync('c:/Users/JAIMIN/Desktop/JAIMIN-PORTFOLIO/src/pages/Home.tsx', content);
console.log('Home.tsx updated with ScrollReveal!');
