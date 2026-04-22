const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, '../public/assets/data/maestra.json');
const reportPath = path.join(__dirname, '../public/assets/data/report_fugas.json');

const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

const nounMapping = {
    'Guarda-chuva': 'Sol e Chuva',
    'Sombrinha': 'Sol e Chuva',
    'Óculos': 'Óculos de Sol',
    'Caneta': 'Canetas',
    'Lápis': 'Lápis e Borrachas',
    'Copo': 'Copos',
    'Caneca': 'Canecas',
    'Mochila': 'Malas e Mochilas',
    'Bolsa': 'Bolsas e Necessaires',
    'Squeeze': 'Squeeze e Garrafas',
    'Garrafa': 'Squeeze e Garrafas',
    'Chaveiro': 'Chaveiros',
    'Agenda': 'Agendas e Cadernos',
    'Caderno': 'Agendas e Cadernos',
};

// 2. Filtro de Incompatibilidad: categories versus what invalidates them.
const exclusionMatrix = {
    'Porta Cartões': ['Lápis', 'Caneta', 'Copo', 'Garrafa', 'Mochila', 'Caderno'],
    'Óculos de sol': ['Guarda-chuva', 'Sombrinha', 'Estojo'],
    'Sol e Chuva': ['Óculos'],
    'Escritório': ['Guarda-chuva', 'Mochila', 'Copo', 'Caneca', 'Garrafa']
};

const changes = [];

data.forEach(product => {
    const originalTags = [...(product.tags || [])];
    const newTags = new Set(originalTags);
    let changeCount = 0;
    const nameUpper = product.name.toUpperCase();

    // 1. Prioridad de Sustantivo Crítico
    for (const [noun, targetCategory] of Object.entries(nounMapping)) {
        if (nameUpper.includes(noun.toUpperCase())) {
            if (!newTags.has(targetCategory)) {
                newTags.add(targetCategory);
                changeCount++;
            }
        }
    }

    // 2. Filtro de Incompatibilidad
    let hasChangedCategory = false;
    for (const [category, exclusions] of Object.entries(exclusionMatrix)) {
        if (newTags.has(category)) {
            let hasExclusion = false;
            for (const excl of exclusions) {
                if (nameUpper.includes(excl.toUpperCase())) {
                    hasExclusion = true;
                    break;
                }
            }
            if (hasExclusion) {
                newTags.delete(category);
                if (nameUpper.includes('LÁPIS') || nameUpper.includes('CANETA')) {
                    newTags.add('Escritório');
                }
                changeCount++;
                hasChangedCategory = true;
            }
        }
    }

    // 3. Barrido de Coincidencias Vacías
    // "Sol" in name but without "Guarda-chuva", "Sombrinha", "Óculos" getting "Sol e Chuva".
    if (newTags.has('Sol e Chuva') && nameUpper.includes('SOL')) {
       if (!nameUpper.includes('GUARDA-CHUVA') && !nameUpper.includes('SOMBRINHA')) {
           newTags.delete('Sol e Chuva');
           changeCount++;
       }
    }
    
    // Also "Porta Cartões" when it has "Porta" but not "Cartões"
    if (newTags.has('Porta Cartões') && nameUpper.includes('PORTA')) {
        if (!nameUpper.includes('CART') && !nameUpper.includes('CARTAO') && !nameUpper.includes('CARTÃO')) {
            newTags.delete('Porta Cartões');
            changeCount++;
        }
    }

    if (changeCount > 0) {
        product.tags = Array.from(newTags);
        changes.push({
            id: product.id,
            name: product.name,
            originalTags,
            newTags: product.tags,
            changesOut: changeCount
        });
    }
});

fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));

changes.sort((a, b) => b.changesOut - a.changesOut);
const top50 = changes.slice(0, 50);

fs.writeFileSync(reportPath, JSON.stringify(top50, null, 2));
console.log("Auditoría completada. Modificados:", changes.length);
