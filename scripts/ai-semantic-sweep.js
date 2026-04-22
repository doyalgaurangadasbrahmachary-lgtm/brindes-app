const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, '../public/assets/data/maestra.json');
let data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

// Stopwords en portugués para procesado de Lenguaje Natural (NLP)
const stopwords = new Set(['de', 'em', 'com', 'para', 'o', 'a', 'e', 'do', 'da', 'sem', 'ou']);

// Extractor de Sustantivo Crítico (Entidad principal)
function getPrimaryNoun(name) {
    let words = name.replace(/[^\w\sÀ-ÿ-]/g, '').split(/\s+/).filter(w => w.length > 2 && !stopwords.has(w.toLowerCase()));
    if (words.length === 0) return '';
    let first = words[0].toUpperCase();

    // Tratamiento de entidades compuestas
    if (['PORTA', 'KIT', 'JOGO', 'CONJUNTO'].includes(first) && words.length > 1) {
        return first + ' ' + words[1].toUpperCase();
    }
    return first;
}

console.log('=== 🧠 INICIANDO MOTOR NER (Name Entity Recognition) ESTADÍSTICO ===');

// 1. Fase de Entrenamiento: Mapeo probabilístico Sustantivo -> Categoría
const categoryNounFreq = {};
const nounPrimaryCategory = {};
const categoryTotalCount = {};

data.forEach(p => {
    let noun = getPrimaryNoun(p.name);
    if (!noun) return;

    (p.tags || []).forEach(tag => {
        if (!categoryNounFreq[tag]) categoryNounFreq[tag] = {};
        categoryNounFreq[tag][noun] = (categoryNounFreq[tag][noun] || 0) + 1;
        categoryTotalCount[tag] = (categoryTotalCount[tag] || 0) + 1;
    });
});

// Inferir la categoría dominante de cada sustantivo (Categoría "Verdadera")
const nounTotalFreq = {};
for (const cat in categoryNounFreq) {
    for (const noun in categoryNounFreq[cat]) {
        if (!nounTotalFreq[noun]) nounTotalFreq[noun] = {};
        nounTotalFreq[noun][cat] = categoryNounFreq[cat][noun];
    }
}

for (const noun in nounTotalFreq) {
    let bestCat = null;
    let maxFreq = 0;
    for (const cat in nounTotalFreq[noun]) {
        if (nounTotalFreq[noun][cat] > maxFreq) {
            maxFreq = nounTotalFreq[noun][cat];
            bestCat = cat;
        }
    }
    nounPrimaryCategory[noun] = { category: bestCat, frequency: maxFreq };
}

// 2. Fase de Inferencia y Purga: Barrido Dimensional
let anomaliesFixed = 0;

data.forEach(p => {
    let noun = getPrimaryNoun(p.name);
    if (!noun || !nounPrimaryCategory[noun]) return;

    let trueCategoryContext = nounPrimaryCategory[noun];
    let originalTags = p.tags || [];
    let newTags = new Set(originalTags);
    let changed = false;

    // Meta-reglas de dominios que son "Cruzados" y no compiten semánticamente (Eventos, Segmentos Comerciales)
    const isGenericOrSegment = (tag) => {
        const segments = ['Bancos', 'Faculdade', 'Concessionária', 'Alimentação', 'Imobiliárias', 'Fármacia', 'Convênios', 'COPA'];
        const generics = ['Novidades', 'Diversos', 'Promoção', 'Ecologicos', 'Ecológicos', 'Linha Feminina', 'Linha Masculina', 'Home e Gourmet', 'Escritório'];
        const isDate = tag.match(/\d{2}\/\d{2}/) || tag.includes('Verão') || tag.includes('Outono') || tag.includes('Natal');
        return segments.some(s => tag.includes(s)) || generics.some(g => tag.includes(g)) || isDate;
    };

    // A. Reubicación Autodidacta
    // Si la entidad tiene una pertenencia muy fuerte a una categoría (>3 repeticiones) y el producto no la tiene, se le asigna.
    if (!newTags.has(trueCategoryContext.category) && trueCategoryContext.frequency > 3) {
        newTags.add(trueCategoryContext.category);
        changed = true;
    }

    // B. Eliminación de Fugas (Anomalías Incompatibles)
    originalTags.forEach(tag => {
        if (tag !== trueCategoryContext.category) {
            let freqInThisCat = categoryNounFreq[tag][noun] || 0;
            // Coeficiente de Alienación: Cuántas veces aparece este sustantivo aquí comparado con su "casa matriz"
            let affinityRatio = freqInThisCat / trueCategoryContext.frequency;

            // Si la categoría no es cruzada (es una categoría de producto real)
            if (!isGenericOrSegment(tag)) {
                // Si la afinidad es casi nula (< 15%), el producto está "huyendo" a una categoría errónea. Purgar.
                if (affinityRatio < 0.15) {
                    newTags.delete(tag);
                    changed = true;
                }
            }
        }
    });

    if (changed) {
        p.tags = Array.from(newTags);
        anomaliesFixed++;
    }
});

fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));

console.log('==================================================');
console.log(`✅ FASE 1: Entrenamiento Completado.`);
console.log(`✅ FASE 2: Inferencia de Catálogo Ejecutada.`);
console.log(`🚀 RESULTADO: Se purgaron dinámicamente ${anomaliesFixed} anomalías semánticas.`);
console.log('==================================================');
