const fs = require('fs');
const path = require('path');

const pProjectDetail = 'c:/Users/JAIMIN/Desktop/JAIMIN-PORTFOLIO/src/pages/ProjectDetail.tsx';
let dProjectDetail = fs.readFileSync(pProjectDetail, 'utf8');
dProjectDetail = dProjectDetail.replace('api.getOtherProjects(id)', 'api.getProjects().then(projects => projects.filter(p => p.id !== id).slice(0, 3))');
fs.writeFileSync(pProjectDetail, dProjectDetail);

const pBlogDetail = 'c:/Users/JAIMIN/Desktop/JAIMIN-PORTFOLIO/src/pages/BlogDetail.tsx';
let dBlogDetail = fs.readFileSync(pBlogDetail, 'utf8');
dBlogDetail = dBlogDetail.replace('api.getRelatedBlogs(id)', 'api.getBlogs().then(blogs => blogs.filter(b => b.id !== id).slice(0, 3))');
fs.writeFileSync(pBlogDetail, dBlogDetail);

const pHome = 'c:/Users/JAIMIN/Desktop/JAIMIN-PORTFOLIO/src/pages/Home.tsx';
let dHome = fs.readFileSync(pHome, 'utf8');
dHome = dHome.replace('api.getBlogs(2)', 'api.getBlogs()');
fs.writeFileSync(pHome, dHome);

const pProjectEditor = 'c:/Users/JAIMIN/Desktop/JAIMIN-PORTFOLIO/src/pages/admin/ProjectEditor.tsx';
let dProjectEditor = fs.readFileSync(pProjectEditor, 'utf8');
if (!dProjectEditor.includes('QUERY_KEYS')) {
    dProjectEditor = `import { QUERY_KEYS } from "../../lib/queryKeys";\n` + dProjectEditor;
    fs.writeFileSync(pProjectEditor, dProjectEditor);
}

const pBlogEditor = 'c:/Users/JAIMIN/Desktop/JAIMIN-PORTFOLIO/src/pages/admin/BlogEditor.tsx';
let dBlogEditor = fs.readFileSync(pBlogEditor, 'utf8');
if (!dBlogEditor.includes('QUERY_KEYS')) {
    dBlogEditor = `import { QUERY_KEYS } from "../../lib/queryKeys";\n` + dBlogEditor;
    fs.writeFileSync(pBlogEditor, dBlogEditor);
}

console.log("Compilation fixes applied");
