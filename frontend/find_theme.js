const fs = require('fs');
const path = require('path');
function searchFiles(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      searchFiles(fullPath);
    } else if (file.endsWith('.jsx') || file.endsWith('.js') || file.endsWith('.css')) {
      const content = fs.readFileSync(fullPath, 'utf8');
      if (content.includes('theme') || content.includes('dark') || content.includes('light') || content.includes('Moon') || content.includes('Sun')) {
        console.log(`Found match in: ${fullPath}`);
      }
    }
  }
}
searchFiles('src');
