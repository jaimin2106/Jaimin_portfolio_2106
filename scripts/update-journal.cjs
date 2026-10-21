const fs = require('fs');
const pJournal = 'c:/Users/JAIMIN/Desktop/JAIMIN-PORTFOLIO/src/components/Journal.tsx';
let dJournal = fs.readFileSync(pJournal, 'utf8');

dJournal = dJournal.replace(
  /text-white">JOURNAL<\/h2>/,
  'text-white">Latest Engineering Articles</h2>'
);

dJournal = dJournal.replace(
  /to=\{`\/blog\/`\}/g,
  'to={`/blog/${article.slug || article.id}`}'
);

dJournal = dJournal.replace(
  /<span className="font-medium text-white group-hover\/link:mr-2 transition-all duration-300">[\s\S]*?Read More[\s\S]*?<\/span>/,
  '<span className="font-medium text-white group-hover/link:mr-2 transition-all duration-300">Read {article.title}</span>'
);

fs.writeFileSync(pJournal, dJournal);
console.log("Journal.tsx updated");
