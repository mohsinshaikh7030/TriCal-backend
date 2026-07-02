const fs = require('fs');
const path = require('path');
const root = path.resolve(process.cwd(), 'src');
function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full);
    } else if (entry.isFile() && full.endsWith('.ts')) {
      let content = fs.readFileSync(full, 'utf8');
      const replaced = content.replace(/from ['"]@\/(.*?)['"];?/g, (match, importPath) => {
        const target = path.join(root, importPath);
        let rel = path.relative(path.dirname(full), target).replace(/\\/g, '/');
        if (!rel.startsWith('.')) rel = './' + rel;
        return `from '${rel}'`;
      });
      if (replaced !== content) {
        fs.writeFileSync(full, replaced, 'utf8');
        console.log('Updated', full);
      }
    }
  }
}
walk(root);
console.log('done');
