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
    if (content.includes('import { api } from "";') || content.includes('import { api } from \'\';')) { 
        // Need to calculate correct relative path to api.ts
        let apiPath = '../services/api';
        if (file.includes('pages/admin')) { apiPath = '../../services/api'; }
        else if (file.includes('pages/')) { apiPath = '../services/api'; }
        else if (file.includes('components/admin')) { apiPath = '../../services/api'; }
        
        content = content.replace(/import \{ api \} from ["']["'];/g, `import { api } from "${apiPath}";`); 
        fs.writeFileSync(file, content); 
        console.log('Fixed', file); 
    } 
});
