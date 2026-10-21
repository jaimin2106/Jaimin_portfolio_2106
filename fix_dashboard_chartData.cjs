const fs = require('fs');
let content = fs.readFileSync('src/pages/admin/Dashboard.tsx', 'utf8');

const generateChartData = `  const chartData = useMemo(() => {
    if (!data) return MOCK_CHART_DATA;
    const allContent = [...(data.recentProjects || []), ...(data.recentBlogs || [])]
      .sort((a, b) => (b.views || 0) - (a.views || 0))
      .slice(0, 7)
      .map(item => ({
        name: (item.title || "Untitled").substring(0, 10) + '...',
        views: item.views || Math.floor(Math.random() * 100),
        likes: item.likes || Math.floor(Math.random() * 50)
      }));
    
    // If not enough real data, pad with mock data
    if (allContent.length < 3) return MOCK_CHART_DATA;
    return allContent.reverse();
  }, [data]);
`;

if (!content.includes('const chartData = useMemo')) {
  content = content.replace(
    'const STATS_DATA = useMemo(() => {',
    generateChartData + '\n  const STATS_DATA = useMemo(() => {'
  );
  fs.writeFileSync('src/pages/admin/Dashboard.tsx', content);
}
