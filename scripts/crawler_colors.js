const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');
const https = require('https');

const BASE_URL = 'https://magazinebrindes.com.br';
const START_URL = 'https://magazinebrindes.com.br/brindes';
const DATA_FILE = path.join(__dirname, '../src/data/maestra.json');

const axiosInstance = axios.create({
  httpsAgent: new https.Agent({ rejectUnauthorized: false }),
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  }
});

const delay = (ms) => new Promise(res => setTimeout(res, ms));

async function getCategoryLinks() {
  console.log('[*] Leyendo el mapa de categorías base...');
  try {
    const { data } = await axiosInstance.get(START_URL);
    const $ = cheerio.load(data);
    const links = [];

    $('.ul_lista a, .d-segmentos .ul-table a, .d-especial .ul-table a').each((i, el) => {
      let href = $(el).attr('href');
      let name = $(el).text().trim();

      if (href && (href.includes('/brindes/') || href.includes('/segmento/') || href.includes('/datas-especiais/')) && name.length > 1) {
        if (!href.startsWith('http')) href = BASE_URL + href;
        links.push({ url: href, category: name });
      }
    });

    const uniqueLinks = [...new Map(links.map(item => [item.url, item])).values()];
    console.log(`[*] Se encontraron ${uniqueLinks.length} categorías.`);
    return uniqueLinks;
  } catch (e) {
    console.error('[!] Error obteniendo mapa base:', e.message);
    return [];
  }
}

async function discoverProductUrls(categories) {
  console.log('\n[=== FASE 1: MAPEAR URLs DE PRODUCTOS ===]');
  const skuMap = new Map();
  
  for (let c = 0; c < categories.length; c++) {
    const catObj = categories[c];
    let page = 1;
    let hasProducts = true;
    let lastPageSignature = "";

    process.stdout.write(`Escaneando categoría [${c+1}/${categories.length}]: ${catObj.category} `);

    while (hasProducts) {
      const pageUrl = page === 1 ? catObj.url : `${catObj.url}?p=${page}`;
      try {
        const { data } = await axiosInstance.get(pageUrl);
        const $ = cheerio.load(data);
        const products = $('.produto, .box-produto, .item-produto, .product-item, li.item');

        if (products.length === 0) {
          hasProducts = false;
          break;
        }

        let currentPageSignature = "";
        products.each((i, el) => {
          const rawText = $(el).text();
          const skuMatch = rawText.match(/MB\d+/);
          const currentSku = skuMatch ? skuMatch[0] : `UNK-${i}`;
          currentPageSignature += currentSku;
          
          if (skuMatch) {
            let href = $(el).find('a').first().attr('href');
            if (href) {
                if (!href.startsWith('http')) href = BASE_URL + href;
                skuMap.set(skuMatch[0], href);
            }
          }
        });

        if (currentPageSignature === lastPageSignature) break;
        lastPageSignature = currentPageSignature;

        page++;
        process.stdout.write(".");
        await delay(50); // Mapeo rápido
      } catch (e) {
        hasProducts = false;
      }
    }
    console.log(""); // Nueva linea tras terminar categoría
  }
  
  console.log(`[*] FASE 1 COMPLETADA: ${skuMap.size} URLs de productos mapeadas.`);
  return skuMap;
}

// Permite hacer limit concurrent tasks
async function asyncPool(poolLimit, array, iteratorFn) {
  const ret = [];
  const executing = [];
  for (const item of array) {
    const p = Promise.resolve().then(() => iteratorFn(item));
    ret.push(p);
    if (poolLimit <= array.length) {
      const e = p.then(() => executing.splice(executing.indexOf(e), 1));
      executing.push(e);
      if (executing.length >= poolLimit) {
        await Promise.race(executing);
      }
    }
  }
  return Promise.all(ret);
}

async function scrapeColorsForUrl(sku, url) {
    try {
        const { data } = await axiosInstance.get(url);
        const $ = cheerio.load(data);
        
        const colors = new Set();
        // Radiografía del Director: div.cor > div.img-cor > span > img -> atributos title y alt
        $('div.cor > div.img-cor > span > img').each((i, el) => {
            let colorName = $(el).attr('title') || $(el).attr('alt');
            if (colorName) colors.add(colorName.trim().toUpperCase());
        });
        
        return Array.from(colors);
    } catch (e) {
        return []; // Retorna vacío si hay error HTTP (404, etc)
    }
}

async function run() {
  console.log('=== INICIANDO EXTRACCIÓN DE COLORES (FRANCOTIRADOR) ===');
  
  // 1. Cargar Maestra
  if (!fs.existsSync(DATA_FILE)) {
      console.error("[!] Error: No se encontró maestra.json");
      return;
  }
  let maestra = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  console.log(`[*] Maestra cargada con ${maestra.length} productos.`);

  // 2. Mapear Categorías
  const categories = await getCategoryLinks();
  
  // 3. Mapear URLs de todos los SKUs
  const skuUrlMap = await discoverProductUrls(categories);

  // 4. Filtrar productos de maestra que tengan URL en el map
  const targetProducts = maestra.filter(p => skuUrlMap.has(p.id));
  console.log(`\n[=== FASE 2: EXTRACCIÓN PROFUNDA DE COLORES (${targetProducts.length} productos a procesar) ===]`);

  let count = 0;
  
  // 5. Workers para raspar en paralelo sin saturar
  const processProduct = async (product) => {
      const url = skuUrlMap.get(product.id);
      const colors = await scrapeColorsForUrl(product.id, url);
      
      if (colors.length > 0) {
          product.colors = colors;
      }
      
      count++;
      if (count % 100 === 0) {
           console.log(`  -> Procesados: ${count} / ${targetProducts.length}`);
           // Guardado seguro intermedio
           fs.writeFileSync(DATA_FILE, JSON.stringify(maestra, null, 2));
      }
  };

  // Concurrency 10 para ser veloces pero amigables
  await asyncPool(10, targetProducts, processProduct);

  // 6. Guardado Final
  fs.writeFileSync(DATA_FILE, JSON.stringify(maestra, null, 2));
  
  console.log('\n=======================================');
  console.log(`✅ ¡SNIPER FINALIZADO!`);
  console.log(`📦 Datos de colores incrustados en maestra.json`);
  console.log('=======================================');
}

run();
