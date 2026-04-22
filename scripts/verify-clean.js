const fs = require('fs');
const path = require('path');
const FILE = path.join(__dirname, '..', 'public', 'assets', 'data', 'maestra.json');
const d = JSON.parse(fs.readFileSync(FILE, 'utf-8'));
let dups = 0;
let spaces = 0;
for (const p of d) {
  if (!Array.isArray(p.tags)) continue;
  const s = new Set(p.tags);
  if (s.size !== p.tags.length) { dups++; console.log('DUP:', p.id, p.tags); }
  for (const t of p.tags) { if (t !== t.trim()) { spaces++; console.log('SPACE:', p.id, JSON.stringify(t)); } }
}
console.log('---');
console.log('Duplicados restantes:', dups);
console.log('Tags con espacios:', spaces);
console.log('Total productos:', d.length);
