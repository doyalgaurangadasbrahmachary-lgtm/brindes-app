const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, '../public/assets/data/maestra.json');
const IMG_DIR = path.join(__dirname, '../public/assets/products');

function runCleaner() {
    console.log('=== INICIANDO PROTOCOLO DE LIMPIEZA (CLEANER V1) ===');

    if (!fs.existsSync(DATA_FILE)) {
        console.error('[!] No se encontró el archivo maestra.json');
        return;
    }

    const rawData = fs.readFileSync(DATA_FILE, 'utf8');
    const products = JSON.parse(rawData);

    const cleanedProductsMap = new Map();
    let stats = { rescued: 0, deleted: 0, merged: 0, untouched: 0 };

    products.forEach(p => {
        let currentId = p.id;
        let currentName = p.name;
        let currentImgPath = p.image;

        // Si es un ID basura generado por el crawler...
        if (currentId.startsWith('MB-UNK')) {
            // Intentar rescatar el SKU real oculto en el nombre (ej: "mB12345 Toalha")
            const match = currentName.match(/MB\d+/i); // 'i' para que no importe si es mayúscula o minúscula

            if (match) {
                const realSku = match[0].toUpperCase();
                // Limpiar el nombre quitándole el SKU
                const cleanName = currentName.replace(new RegExp(realSku, 'i'), '').replace(/^-/, '').trim();

                // Preparar el renombrado del archivo físico de la imagen
                const oldFilename = path.basename(currentImgPath);
                const newFilename = `${realSku}.jpg`;
                const oldPhysicalPath = path.join(IMG_DIR, oldFilename);
                const newPhysicalPath = path.join(IMG_DIR, newFilename);

                if (fs.existsSync(oldPhysicalPath)) {
                    try {
                        fs.renameSync(oldPhysicalPath, newPhysicalPath);
                    } catch (e) {
                        console.log(`[!] Error renombrando imagen: ${oldFilename}`);
                    }
                }

                // Actualizar los datos del producto
                p.id = realSku;
                p.name = cleanName || `Produto ${realSku}`;
                p.image = `/assets/products/${newFilename}`;
                stats.rescued++;
            } else {
                // BASURA IRRECUPERABLE: Eliminar imagen física y omitir del JSON
                const physicalPathToDelete = path.join(IMG_DIR, path.basename(currentImgPath));
                if (fs.existsSync(physicalPathToDelete)) {
                    try {
                        fs.unlinkSync(physicalPathToDelete);
                    } catch (e) { }
                }
                stats.deleted++;
                return; // Corta la ejecución de este ciclo (no se añade al mapa)
            }
        } else {
            stats.untouched++;
        }

        // SISTEMA DE FUSIÓN (Anti-duplicados)
        // Si al rescatar un producto resulta que ya existía, unimos sus etiquetas
        if (cleanedProductsMap.has(p.id)) {
            const existingProduct = cleanedProductsMap.get(p.id);
            const combinedTags = new Set([...existingProduct.tags, ...p.tags]);
            existingProduct.tags = Array.from(combinedTags);
            stats.merged++;
        } else {
            // Si el nombre quedó vacío por algún error raro, le ponemos un nombre por defecto
            if (!p.name || p.name.trim() === '') p.name = `Produto ${p.id}`;
            cleanedProductsMap.set(p.id, p);
        }
    });

    const finalArray = Array.from(cleanedProductsMap.values());
    fs.writeFileSync(DATA_FILE, JSON.stringify(finalArray, null, 2));

    console.log('\n=======================================');
    console.log(`✅ ¡LIMPIEZA FINALIZADA CON ÉXITO!`);
    console.log(`🛡️  Productos Intactos: ${stats.untouched}`);
    console.log(`🚑  Productos Rescatados y Renombrados: ${stats.rescued}`);
    console.log(`🗑️  Productos Basura Eliminados: ${stats.deleted}`);
    console.log(`🔗  Duplicados Fusionados: ${stats.merged}`);
    console.log(`📦  TOTAL FINAL EN CATÁLOGO: ${finalArray.length}`);
    console.log('=======================================');
}

runCleaner();