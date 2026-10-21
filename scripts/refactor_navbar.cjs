const fs = require('fs');

let content = fs.readFileSync('c:/Users/JAIMIN/Desktop/JAIMIN-PORTFOLIO/src/components/Navbar.tsx', 'utf8');

if (!content.includes('import { VARIANTS')) {
  content = content.replace('import { motion, AnimatePresence } from "motion/react";', 'import { motion, AnimatePresence } from "motion/react";\nimport { VARIANTS } from "../lib/motion";');
}

content = content.replace(/initial=\{\{\s*y:\s*-100,\s*opacity:\s*0\s*\}\}\s*animate=\{\{\s*y:\s*0,\s*opacity:\s*1\s*\}\}\s*transition=\{\{[\s\S]*?\}\}/, 'initial={{ y: -20, opacity: 0 }}\n        animate={{ y: 0, opacity: 1 }}\n        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}');

fs.writeFileSync('c:/Users/JAIMIN/Desktop/JAIMIN-PORTFOLIO/src/components/Navbar.tsx', content);
console.log('Navbar.tsx fully updated!');
