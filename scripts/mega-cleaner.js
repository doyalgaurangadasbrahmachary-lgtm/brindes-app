const fs = require('fs');
const path = require('path');

// Ruta al archivo maestra.json
const filePath = path.join(__dirname, '../public/assets/data/maestra.json');

try {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    let fixedProducts = 0;

    data.forEach(product => {
        if (product.tags && Array.isArray(product.tags)) {
            const originalLength = product.tags.length;

            // 1. Limpiar cada tag: quitar espacios extremos y convertir dobles espacios en uno solo
            const cleanTags = product.tags.map(tag =>
                tag.trim().replace(/\s+/g, ' ')
            );

            // 2. Eliminar duplicados usando un Set
            product.tags = [...new Set(cleanTags)];

            // Contar si hubo cambios en este producto
            if (JSON.stringify(product.tags) !== JSON.stringify(data.find(p => p.id === product.id).tags)) {
                fixedProducts++;
            }
        }
    });

    // Guardar los cambios
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    console.log(`\n✅ ¡OPERACIÓN EXITOSA!`);
    console.log(`----------------------------------`);
    console.log(`📦 Productos analizados: ${data.length}`);
    console.log(`🧹 Productos corregidos: ${fixedProducts}`);
    console.log(`----------------------------------`);

} catch (error) {
    console.error("❌ Error al procesar el archivo:", error.message);
}