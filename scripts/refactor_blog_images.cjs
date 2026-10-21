const fs = require('fs');
let content = fs.readFileSync('c:/Users/JAIMIN/Desktop/JAIMIN-PORTFOLIO/src/pages/BlogDetail.tsx', 'utf8');

// 1. Hero Banner Container
const heroContainerOld = `className="w-full aspect-[16/9] md:aspect-[21/9] max-h-[520px] md:max-h-[600px] rounded-2xl md:rounded-[2rem] overflow-hidden border border-black/5 shadow-xl relative bg-gray-50"`;
const heroContainerNew = `className="w-full rounded-2xl md:rounded-[2rem] overflow-hidden border border-black/5 shadow-xl relative bg-gray-50 flex justify-center"`;
content = content.replace(heroContainerOld, heroContainerNew);

// 2. Hero Banner Image
const heroImgOld = `className="w-full h-full object-cover"`;
const heroImgNew = `className="max-w-full h-auto object-contain mx-auto"`;
// Using regex to ensure we only replace the first occurrence or the specific one inside ProgressiveImage. Wait, there are multiple ProgressiveImage usages. Let's use a more robust replace.
content = content.replace(
  /<ProgressiveImage[\s\S]*?className="w-full h-full object-cover"[\s\S]*?\/>/,
  (match) => match.replace('className="w-full h-full object-cover"', 'className="max-w-full h-auto object-contain mx-auto"')
);

// 3. Inline Markdown Images (ContentImage)
const inlineImgOld = `className="w-full h-auto rounded-2xl md:rounded-[2rem] shadow-lg border border-black/5 object-cover cursor-zoom-in transition-transform duration-500 hover:scale-[1.01]"`;
const inlineImgNew = `className="max-w-full h-auto mx-auto rounded-2xl md:rounded-[2rem] shadow-lg border border-black/5 object-contain cursor-zoom-in transition-transform duration-500 hover:scale-[1.01]"`;
content = content.replace(inlineImgOld, inlineImgNew);

// 4. Prose Image Tailwind Configuration
const proseImgOld = `prose-img:rounded-2xl md:prose-img:rounded-[2rem] prose-img:shadow-xl prose-img:my-12 prose-img:w-full`;
const proseImgNew = `prose-img:rounded-2xl md:prose-img:rounded-[2rem] prose-img:shadow-xl prose-img:my-12 prose-img:max-w-full prose-img:h-auto prose-img:mx-auto`;
content = content.replace(proseImgOld, proseImgNew);

fs.writeFileSync('c:/Users/JAIMIN/Desktop/JAIMIN-PORTFOLIO/src/pages/BlogDetail.tsx', content);
console.log('BlogDetail.tsx successfully updated.');
