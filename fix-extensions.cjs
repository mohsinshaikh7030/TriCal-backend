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
      const updated = content.replace(/^(\s*(?:import|export)\s.*?from\s*)(['"])(\.\.?\/[^'"\n]+?)(['"])(;?)/gm, (match, prefix, quote, spec, closing, semi) => {
        if (spec.endsWith('.ts') || spec.endsWith('.js') || spec.endsWith('.json')) return match;
        if (spec.includes(':') || spec.startsWith('http') || spec.startsWith('@')) return match;
        const candidateTs = path.resolve(path.dirname(full), spec + '.ts');
        const candidateIndexTs = path.resolve(path.dirname(full), spec, 'index.ts');
        if (fs.existsSync(candidateTs)) {
          return `${prefix}${quote}${spec}.ts${closing}${semi}`;
        }
        if (fs.existsSync(candidateIndexTs)) {
          return `${prefix}${quote}${spec}/index.ts${closing}${semi}`;
        }
        return match;
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
