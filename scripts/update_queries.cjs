const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(function(file) {
        file = dir + '/' + file;
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) { 
            results = results.concat(walk(file));
        } else { 
            if (file.endsWith('.tsx') || file.endsWith('.ts')) {
                results.push(file);
            }
        }
    });
    return results;
}

const files = walk('C:/Users/JAIMIN/Desktop/JAIMIN-PORTFOLIO/src');
files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let modified = false;

    // We only modify if we find a 'useQuery' and the file is not queryKeys.ts
    if (file.includes('queryKeys.ts') || file.includes('App.tsx') || file.includes('useEngagement.ts')) return;

    if (content.includes('useQuery')) {
        // Ensure imports
        if (!content.includes('QUERY_KEYS')) {
             content = content.replace(/import \{ api \} from "([^"]+)";/, 'import { api } from "";\nimport { QUERY_KEYS, STALE_TIMES } from "../lib/queryKeys";');
             content = content.replace(/import \{ api \} from '([^']+)';/, 'import { api } from "";\nimport { QUERY_KEYS, STALE_TIMES } from "../lib/queryKeys";');
             
             // Fallback for paths that might need resolving relative to src/lib
             if (!content.includes('QUERY_KEYS')) {
                // If api wasn't imported, try finding useQuery import
                content = content.replace(/import \{ useQuery \} from ['"]@tanstack\/react-query['"];/, 'import { useQuery } from "@tanstack/react-query";\nimport { QUERY_KEYS, STALE_TIMES } from "@/lib/queryKeys";'.replace('@/lib/queryKeys', file.includes('pages/admin') ? '../../lib/queryKeys' : file.includes('pages/') ? '../lib/queryKeys' : file.includes('components/admin') ? '../../lib/queryKeys' : '../lib/queryKeys'));
             }
             modified = true;
        }

        // Replacements
        const replacements = [
            { s: /queryKey:\s*\[['"]public_hero['"]\]/g, r: 'queryKey: QUERY_KEYS.hero' },
            { s: /queryKey:\s*\[['"]public_projects['"]\]/g, r: 'queryKey: QUERY_KEYS.projects' },
            { s: /queryKey:\s*\[['"]public_blogs['"]\]/g, r: 'queryKey: QUERY_KEYS.blogs' },
            { s: /queryKey:\s*\[['"]public_testimonials['"]\]/g, r: 'queryKey: QUERY_KEYS.testimonials' },
            { s: /queryKey:\s*\[['"]public_faqs['"]\]/g, r: 'queryKey: QUERY_KEYS.faqs' },
            { s: /queryKey:\s*\[['"]public_capabilities['"]\]/g, r: 'queryKey: QUERY_KEYS.capabilities' },
            { s: /queryKey:\s*\[['"]public_stats['"]\]/g, r: 'queryKey: QUERY_KEYS.stats' },
            { s: /queryKey:\s*\[['"]public_settings['"]\]/g, r: 'queryKey: QUERY_KEYS.settings' },
            { s: /staleTime:\s*\d+\s*\*\s*\d+\s*\*\s*\d+/g, r: 'staleTime: STALE_TIMES.projects' }, // Defaulting any hardcoded ones that aren't mapped properly to one of the constants, actually let's only do it if it matches exactly
        ];

        replacements.forEach(({s, r}) => {
            if (s.test(content)) {
                content = content.replace(s, r);
                modified = true;
            }
        });

        if (modified) {
            fs.writeFileSync(file, content, 'utf8');
            console.log('Modified', file);
        }
    }
});
console.log('Done');
