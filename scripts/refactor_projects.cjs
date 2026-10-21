const fs = require('fs');

let content = fs.readFileSync('c:/Users/JAIMIN/Desktop/JAIMIN-PORTFOLIO/src/pages/Projects.tsx', 'utf8');

// Replace netlify url
content = content.replace(/portfoliojaimin\.netlify\.app/g, 'jaiminumaraniya.me');

// Fix JSON-LD URL
content = content.replace(
  /"url": \`https:\/\/jaiminumaraniya\.me\/projects\/\`,/g,
  '"url": `https://jaiminumaraniya.me/projects/${p.slug || p.id}`,'
);

// Add isError
content = content.replace(
  /const \{ data: projects = \[\], isLoading: loading \} = useQuery\(\{/g,
  'const { data: projects = [], isLoading: loading, isError } = useQuery({'
);

// Replace error state
const errorState = `  if (loading) return <PageSkeleton />;
  if (isError) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center text-center px-4">
        <h2 className="text-xl font-bold mb-2 text-black">Unable to load projects</h2>
        <p className="text-gray-500 mb-6">There was a problem fetching the projects data.</p>
        <button onClick={() => window.location.reload()} className="px-6 py-2 bg-black text-white rounded-full text-sm font-medium hover:bg-gray-800 transition-colors">
          Try Again
        </button>
      </div>
    );
  }`;
content = content.replace(/  if \(loading\) return <PageSkeleton \/>;/g, errorState);

// Replace empty state
const emptyStateStr = `<div className="text-center py-32 text-gray-400 font-mono text-sm">
              No projects found for "{filter}".
            </div>`;

const newEmptyState = `<motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center justify-center py-32 px-4 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                <Layers className="w-6 h-6 text-gray-400" />
              </div>
              <h3 className="text-2xl font-display font-bold text-black mb-2">No projects found</h3>
              <p className="text-gray-500 max-w-md mx-auto mb-8">There aren't any projects matching the "{filter}" category right now. Try removing the filter to explore all works.</p>
              <button
                onClick={() => setFilter("All")}
                className="px-6 py-3 bg-white border border-black/10 text-black hover:border-black hover:bg-black hover:text-white transition-all rounded-full font-medium text-sm flex items-center gap-2 shadow-sm"
              >
                Clear Filters
              </button>
            </motion.div>`;

content = content.replace(emptyStateStr, newEmptyState);

fs.writeFileSync('c:/Users/JAIMIN/Desktop/JAIMIN-PORTFOLIO/src/pages/Projects.tsx', content);
console.log('Projects.tsx updated!');
