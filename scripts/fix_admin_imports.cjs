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
const files = walk('C:/Users/JAIMIN/Desktop/JAIMIN-PORTFOLIO/src/pages/admin');
files.forEach(file => { 
    let content = fs.readFileSync(file, 'utf8'); 
    if (content.includes('from "../lib/queryKeys"')) { 
        content = content.replace(/from "\.\.\/lib\/queryKeys"/g, 'from "../../lib/queryKeys"'); 
        fs.writeFileSync(file, content); 
        console.log('Fixed', file); 
    } 
});
