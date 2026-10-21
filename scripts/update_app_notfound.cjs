const fs = require('fs');
let appContent = fs.readFileSync('c:/Users/JAIMIN/Desktop/JAIMIN-PORTFOLIO/src/App.tsx', 'utf8');

if (!appContent.includes('const NotFound')) {
  appContent = appContent.replace(
    'const Seed = lazy(() => import("./pages/Seed"));',
    'const Seed = lazy(() => import("./pages/Seed"));\nconst NotFound = lazy(() => import("./pages/NotFound"));'
  );
}

if (!appContent.includes('<Route path="*" element={<NotFound />} />')) {
  appContent = appContent.replace(
    '<Route path="seed" element={<Seed />} />',
    '<Route path="seed" element={<Seed />} />\n              <Route path="*" element={<NotFound />} />'
  );
}

fs.writeFileSync('c:/Users/JAIMIN/Desktop/JAIMIN-PORTFOLIO/src/App.tsx', appContent, 'utf8');
console.log('App.tsx updated');
