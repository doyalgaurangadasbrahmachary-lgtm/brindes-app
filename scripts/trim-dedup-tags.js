/**
 * trim-dedup-tags.js
 * --------------------------------------------------
 * Operación quirúrgica sobre maestra.json:
 *   1. Trim: elimina espacios en blanco al inicio/final de cada tag.
 *   2. Dedup: elimina tags duplicadas dentro de cada producto.
 * NO realiza ningún otro cambio.
 * --------------------------------------------------
 */

const fs = require('fs');
const path = require('path');

const FILE = path.join(__dirname, '..', 'public', 'assets', 'data', 'maestra.json');

// --- Leer archivo ---
const raw = fs.readFileSync(FILE, 'utf-8');
const products = JSON.parse(raw);

let totalTrimmed = 0;
let totalDupsRemoved = 0;
const report = [];

for (const product of products) {
  if (!Array.isArray(product.tags)) continue;

  const original = [...product.tags];

  // Paso 1: Trim cada tag
  const trimmed = product.tags.map(t => t.trim());
  const trimCount = trimmed.filter((t, i) => t !== product.tags[i]).length;

  // Paso 2: Eliminar duplicados (preserva el primer encontrado)
  const unique = [...new Set(trimmed)];
  const dupCount = trimmed.length - unique.length;

  if (trimCount > 0 || dupCount > 0) {
    report.push({
      id: product.id,
      name: product.name,
      before: original,
      after: unique,
      trimmed: trimCount,
      dupsRemoved: dupCount
    });
    totalTrimmed += trimCount;
    totalDupsRemoved += dupCount;
    product.tags = unique;
  }
}

// --- Escribir archivo ---
fs.writeFileSync(FILE, JSON.stringify(products, null, 2), 'utf-8');

// --- Reporte ---
console.log('='.repeat(60));
console.log('  REPORTE: Limpieza de Duplicados y Espacios');
console.log('='.repeat(60));
console.log(`  Productos afectados: ${report.length}`);
console.log(`  Tags con espacios corregidos (trim): ${totalTrimmed}`);
console.log(`  Tags duplicadas eliminadas: ${totalDupsRemoved}`);
console.log('='.repeat(60));

if (report.length > 0) {
  console.log('\nDetalle por producto:\n');
  for (const r of report) {
    console.log(`  [${r.id}] ${r.name}`);
    console.log(`    ANTES : ${JSON.stringify(r.before)}`);
    console.log(`    DESPUÉS: ${JSON.stringify(r.after)}`);
    if (r.trimmed > 0) console.log(`    → ${r.trimmed} tag(s) con espacios corregidos`);
    if (r.dupsRemoved > 0) console.log(`    → ${r.dupsRemoved} tag(s) duplicada(s) eliminada(s)`);
    console.log('');
  }
}

console.log('✅ maestra.json actualizado exitosamente.');
