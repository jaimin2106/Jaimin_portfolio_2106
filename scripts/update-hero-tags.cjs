const fs = require('fs');
const pHero = 'c:/Users/JAIMIN/Desktop/JAIMIN-PORTFOLIO/src/components/Hero.tsx';
let dHero = fs.readFileSync(pHero, 'utf8');

// Change h2 to h1
dHero = dHero.replace(
  /<h2 className="font-hero(.*?)>\s*\{heroData\.name\}\s*<\/h2>/,
  '<h1 className="font-hero$1>\n                  {heroData.name}\n                </h1>'
);

// Update buttons
dHero = dHero.replace(
  /View Projects/,
  'Explore My Projects'
);

// Replace resume button with read my articles
const resumeBtnRegex = /<MagneticButton strength=\{0\.2\}>[\s\S]*?<a[\s\S]*?Resume[\s\S]*?<\/a>[\s\S]*?<\/MagneticButton>/;
const readArticlesBtn = `<MagneticButton strength={0.2}>
                <Link
                  to="/blog"
                  className="inline-flex items-center gap-2 bg-white text-[#0A0A0A] border border-black/10 px-6 sm:px-7 py-[14px] rounded-full font-mono font-semibold text-[11px] sm:text-[12px] uppercase tracking-[0.14em] hover:border-black/25 hover:bg-gray-50 transition-colors duration-300 whitespace-nowrap shadow-sm"
                >
                  <ArrowUpRight className="w-3.5 h-3.5 flex-shrink-0" />
                  Read My Articles
                </Link>
              </MagneticButton>`;
dHero = dHero.replace(resumeBtnRegex, readArticlesBtn);

// Add supporting technology line
const subtitleRegex = /(<p className="font-mono.*?\{heroData\.subtitle\}.*?<\/p>)/;
const subtitleReplacement = `$1\n              <p className="font-mono text-[11px] sm:text-[13px] text-gray-500 font-medium tracking-wide leading-relaxed mb-6 sm:mb-8">\n                React · Next.js · Node.js · TypeScript · AI · SaaS · Technical SEO\n              </p>`;
dHero = dHero.replace(subtitleRegex, subtitleReplacement);

fs.writeFileSync(pHero, dHero);
console.log("Hero component updated with semantic tags and CTAs");
