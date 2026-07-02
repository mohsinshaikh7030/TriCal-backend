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
      const updated = content.replace(/import \{([^}]*?)\} from 'express';/g, (match, names) => {
        const imports = names.split(',').map(name => name.trim()).filter(Boolean);
        const valueImports = imports.filter(name => name !== 'Request' && name !== 'Response' && name !== 'NextFunction' && name !== 'Application');
        const typeImports = imports.filter(name => name === 'Request' || name === 'Response' || name === 'NextFunction' || name === 'Application');
        let result = '';
        if (valueImports.length > 0) {
          result += `import { ${valueImports.join(', ')} } from 'express';`;
        }
        if (typeImports.length > 0) {
          if (result.length > 0) result += '\n';
          result += `import type { ${typeImports.join(', ')} } from 'express';`;
        }
        return result || match;
      });
      if (updated !== content) {
        fs.writeFileSync(full, updated, 'utf8');
        console.log('Updated', full);
      }
    }
  }
}
walk(root);
console.log('done');
