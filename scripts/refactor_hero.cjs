const fs = require('fs');

let content = fs.readFileSync('c:/Users/JAIMIN/Desktop/JAIMIN-PORTFOLIO/src/components/Hero.tsx', 'utf8');

// If already replaced the import but with a weird `n, let's fix it
content = content.replace(/import \{ motion \} from "motion\/react";`nimport \{ VARIANTS, TRANSITIONS \} from "\.\.\/lib\/motion";/, 'import { motion } from "motion/react";\nimport { VARIANTS, TRANSITIONS } from "../lib/motion";');

if (!content.includes('import { VARIANTS')) {
  content = content.replace('import { motion } from "motion/react";', 'import { motion } from "motion/react";\nimport { VARIANTS, TRANSITIONS } from "../lib/motion";');
}

// 1. Container Stagger
content = content.replace(
  /<div className="w-full max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-12 lg:gap-20">/,
  '<motion.div initial="hidden" animate="visible" variants={VARIANTS.staggerContainer} className="w-full max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-12 lg:gap-20">'
);
content = content.replace(
  /<\/div>\s*<\/div>\s*\{\/\* Scroll indicator \*\/\}/,
  '</motion.div>\n      </div>\n\n      {/* Scroll indicator */}'
);

// Replace all these specific initial/animate/transition blocks with variants
content = content.replace(/initial=\{\{\s*opacity:\s*0,\s*scale:\s*0\.9\s*\}\}\s*animate=\{\{\s*opacity:\s*1,\s*scale:\s*1\s*\}\}\s*transition=\{\{[\s\S]*?\}\}/g, 'variants={VARIANTS.fadeInUp}');
content = content.replace(/initial=\{\{\s*opacity:\s*0,\s*y:\s*16\s*\}\}\s*animate=\{\{\s*opacity:\s*1,\s*y:\s*0\s*\}\}\s*transition=\{\{[\s\S]*?\}\}/g, 'variants={VARIANTS.fadeInUp}');
content = content.replace(/initial=\{\{\s*opacity:\s*0,\s*y:\s*14\s*\}\}\s*animate=\{\{\s*opacity:\s*1,\s*y:\s*0\s*\}\}\s*transition=\{\{[\s\S]*?\}\}/g, 'variants={VARIANTS.fadeInUp}');
content = content.replace(/initial=\{\{\s*opacity:\s*0,\s*y:\s*12\s*\}\}\s*animate=\{\{\s*opacity:\s*1,\s*y:\s*0\s*\}\}\s*transition=\{\{[\s\S]*?\}\}/g, 'variants={VARIANTS.fadeInUp}');
content = content.replace(/initial=\{\{\s*opacity:\s*0,\s*y:\s*10\s*\}\}\s*animate=\{\{\s*opacity:\s*1,\s*y:\s*0\s*\}\}\s*transition=\{\{[\s\S]*?\}\}/g, 'variants={VARIANTS.fadeInUp}');
content = content.replace(/initial=\{\{\s*opacity:\s*0,\s*scale:\s*0\s*\}\}\s*animate=\{\{\s*opacity:\s*1,\s*scale:\s*1\s*\}\}\s*transition=\{\{[\s\S]*?\}\}/g, 'variants={VARIANTS.scaleUp}');

// Fix Scroll indicator
content = content.replace(/initial=\{\{\s*opacity:\s*0\s*\}\}\s*animate=\{\{\s*opacity:\s*1\s*\}\}\s*transition=\{\{\s*delay:\s*1\.2,\s*duration:\s*0\.8\s*\}\}/, 'initial="hidden" animate="visible" variants={VARIANTS.fadeIn}');

fs.writeFileSync('c:/Users/JAIMIN/Desktop/JAIMIN-PORTFOLIO/src/components/Hero.tsx', content);
console.log('Hero.tsx fully updated!');
