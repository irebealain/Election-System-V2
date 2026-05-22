import fs from 'fs';
import path from 'path';

const dirToSearch = [
  './src/components',
  './src/pages',
  './src/layouts'
];

// Regex to match rounded classes, except rounded-full and rounded-[20px]
// This regex will find instances of rounded-none, rounded-sm, rounded-md, rounded-lg, rounded-xl, rounded-2xl
// and rounded-[10px], rounded-[8px] etc.
const roundedRegex = /\brounded-(none|sm|md|lg|xl|2xl|\[(?!(20px|50%|100%|full)\b)[^\]]+\])\b/g;

function walkSync(currentDirPath, callback) {
    fs.readdirSync(currentDirPath).forEach(function (name) {
        var filePath = path.join(currentDirPath, name);
        var stat = fs.statSync(filePath);
        if (stat.isFile()) {
            if (filePath.endsWith('.jsx') || filePath.endsWith('.tsx') || filePath.endsWith('.js')) {
                callback(filePath, stat);
            }
        } else if (stat.isDirectory()) {
            walkSync(filePath, callback);
        }
    });
}

let modifiedCount = 0;

dirToSearch.forEach(dir => {
    const fullPath = path.resolve(dir);
    if (!fs.existsSync(fullPath)) return;
    
    walkSync(fullPath, function(filePath) {
        let content = fs.readFileSync(filePath, 'utf8');
        
        if (roundedRegex.test(content)) {
            let newContent = content.replace(roundedRegex, 'rounded-[20px]');
            fs.writeFileSync(filePath, newContent, 'utf8');
            modifiedCount++;
            console.log(`Modified: ${filePath}`);
        }
    });
});

console.log(`Successfully modified ${modifiedCount} files.`);
