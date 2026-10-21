const fs = require('fs');
const pContact = 'c:/Users/JAIMIN/Desktop/JAIMIN-PORTFOLIO/src/components/Contact.tsx';
let dContact = fs.readFileSync(pContact, 'utf8');

dContact = dContact.replace(
  /Let's Build Something <span className="text-\[#E85D04\]">Exceptional<\/span> Together\./,
  'Have a Product or Technical <span className="text-[#E85D04]">Challenge?</span>'
);

dContact = dContact.replace(
  /Whether you have a fully fleshed-out concept or just an initial idea, I can help you build scalable and robust digital products\./,
  "Whether you're building a new application, improving an existing product, adding AI capabilities, or solving technical SEO and performance problems, I'm interested in building practical solutions that scale."
);

dContact = dContact.replace(
  /Start a Project/,
  "Let's Work Together"
);

dContact = dContact.replace(
  /Copy Email/,
  "View My Projects"
);

// We need to change the copy email button to be a link to /#projects or /projects
dContact = dContact.replace(
  /<button className="flex justify-center items-center gap-2 px-8 py-4\.5 sm:py-5 rounded-full border border-white\/20 text-white font-medium text-sm sm:text-base tracking-wide uppercase active:bg-white\/10 hover:bg-white\/10 transition-colors w-full sm:w-auto min-h-\[56px\]">\s*<Copy className="w-4 h-4 sm:w-5 sm:h-5" \/> View My Projects\s*<\/button>/,
  `<Link to="/projects" className="flex justify-center items-center gap-2 px-8 py-4.5 sm:py-5 rounded-full border border-white/20 text-white font-medium text-sm sm:text-base tracking-wide uppercase active:bg-white/10 hover:bg-white/10 transition-colors w-full sm:w-auto min-h-[56px]">\n                <ArrowUpRight className="w-4 h-4 sm:w-5 sm:h-5" /> View My Projects\n              </Link>`
);

fs.writeFileSync(pContact, dContact);
console.log("Contact.tsx updated");
