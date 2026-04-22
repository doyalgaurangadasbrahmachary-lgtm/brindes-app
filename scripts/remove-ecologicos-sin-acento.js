/**
 * remove-ecologicos-sin-acento.js
 * Elimina la tag "Ecologicos" (sin acento) de todos los productos.
 * Si el producto ya tiene "Ecológicos" (con acento), solo elimina la sin acento.
 * Si el producto SOLO tiene "Ecologicos" (sin acento), la reemplaza por "Ecológicos".
 */

const fs = require('fs');
const path = require('path');

const FILE = path.join(__dirname, '..', 'public', 'assets', 'data', 'maestra.json');
const data = JSON.parse(fs.readFileSync(FILE, 'utf-8'));

let removed = 0;
let replaced = 0;
const report = [];

for (const p of data) {
  if (!Array.isArray(p.tags)) continue;

  const hasConAccento = p.tags.includes('Ecológicos');
  const hasSinAccento = p.tags.includes('Ecologicos');

  if (!hasSinAccento) continue;

  if (hasConAccento) {
    // Tiene ambas → eliminar la sin acento
    p.tags = p.tags.filter(t => t !== 'Ecologicos');
    removed++;
    report.push(`  [${p.id}] ${p.name} → ELIMINADA "Ecologicos" (ya tenía "Ecológicos")`);
  } else {
    // Solo tiene sin acento → reemplazar por con acento
    p.tags = p.tags.map(t => t === 'Ecologicos' ? 'Ecológicos' : t);
    replaced++;
    report.push(`  [${p.id}] ${p.name} → REEMPLAZADA "Ecologicos" → "Ecológicos"`);
  }
}

fs.writeFileSync(FILE, JSON.stringify(data, null, 2), 'utf-8');

console.log('='.repeat(60));
console.log('  REPORTE: Eliminación de "Ecologicos" sin acento');
console.log('='.repeat(60));
console.log(`  Eliminadas (duplicada): ${removed}`);
console.log(`  Reemplazadas (única):   ${replaced}`);
console.log(`  Total afectados:        ${removed + replaced}`);
console.log('='.repeat(60));
if (report.length > 0) {
  console.log('\nDetalle:\n');
  report.forEach(r => console.log(r));
}
console.log('\n✅ maestra.json actualizado.');
