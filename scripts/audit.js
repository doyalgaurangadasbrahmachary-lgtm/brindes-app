const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, '../public/assets/data/maestra.json');
const REPORT_FILE = path.join(__dirname, '../reporte_categorias.txt');

function generateAuditReport() {
    console.log('=== GENERANDO REPORTE DE AUDITORÍA ===');

    const rawData = fs.readFileSync(DATA_FILE, 'utf8');
    const products = JSON.parse(rawData);

    // Agrupar productos por etiqueta
    const categoryMap = {};

    products.forEach(p => {
        p.tags.forEach(tag => {
            if (!categoryMap[tag]) {
                categoryMap[tag] = [];
            }
            categoryMap[tag].push(`  - [${p.id}] ${p.name}`);
        });
    });

    // Ordenar las categorías alfabéticamente
    const sortedCategories = Object.keys(categoryMap).sort();

    let reportContent = `REPORTE DE AUDITORÍA DE CATEGORÍAS\n`;
    reportContent += `Total de Productos Únicos: ${products.length}\n`;
    reportContent += `=========================================\n\n`;

    sortedCategories.forEach(cat => {
        reportContent += `📂 CATEGORÍA: ${cat} (${categoryMap[cat].length} productos)\n`;
        reportContent += `-----------------------------------------\n`;
        // Ordenar los productos dentro de la categoría
        reportContent += categoryMap[cat].sort().join('\n');
        reportContent += `\n\n`;
    });

    fs.writeFileSync(REPORT_FILE, reportContent);

    console.log(`✅ ¡Reporte generado con éxito!`);
    console.log(`📄 Abre el archivo 'reporte_categorias.txt' en la raíz de tu proyecto.`);
}

generateAuditReport();