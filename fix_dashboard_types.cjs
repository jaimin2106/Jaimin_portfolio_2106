const fs = require('fs');
let content = fs.readFileSync('src/pages/admin/Dashboard.tsx', 'utf8');

// fix mock data
content = content.replace(/visitors: /g, 'likes: ');

// fix chartData useMemo
content = content.replace(
  'const allContent = [...(data.projects || []), ...(data.blogs || [])]',
  'const allContent = [...(data.recentProjects || []), ...(data.recentBlogs || [])]'
);

fs.writeFileSync('src/pages/admin/Dashboard.tsx', content);
