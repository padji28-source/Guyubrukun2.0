import fs from 'fs';
import path from 'path';

const dir = './src';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.tsx'));

for (const file of files) {
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Replace window.confirm
  content = content.replace(/if\s*\(\s*!window\.confirm\([^)]+\)\s*\)\s*return;/g, '');
  
  // Replace alert
  content = content.replace(/alert\((.*?)\)/g, 'console.log($1)');
  
  fs.writeFileSync(filePath, content);
}
console.log('Fixed modals');
