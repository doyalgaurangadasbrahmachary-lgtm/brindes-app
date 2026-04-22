const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');
const https = require('https');

const BASE_URL = 'https://magazinebrindes.com.br';
const START_URL = 'https://magazinebrindes.com.br/brindes';
const DATA_FILE = path.join(__dirname, '../src/data/maestra.json');
const IMG_DIR = path.join(__dirname, '../public/assets/products');

const axiosInstance = axios.create({
  httpsAgent: new https.Agent({ rejectUnauthorized: false }),
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  }
});

const delay = (ms) => new Promise(res => setTimeout(res, ms));

async function downloadImage(url, filename) {
  if (!fs.existsSync(IMG_DIR)) fs.mkdirSync(IMG_DIR, { recursive: true });
  const filepath = path.join(IMG_DIR, filename);
  if (fs.existsSync(filepath)) return filename;

  try {
    const response = await axiosInstance({ url, responseType: 'stream' });
    return new Promise((resolve, reject) => {
      const writer = fs.createWriteStream(filepath);
      response.data.pipe(writer);
      writer.on('finish', () => resolve(filename));
      writer.on('error', reject);
    });
  } catch (error) {
    return null;
  }
}

async function getCategoryLinks() {
  console.log('[*] Leyendo el mapa completo (A-Z, Segmentos y Datas Especiais)...');
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
    console.log(`[*] Se encontraron ${uniqueLinks.length} rutas exactas a escanear.`);
    return uniqueLinks;
  } catch (e) {
    console.error('[!] Error obteniendo mapa base:', e.message);
    return [];
  }
}

async function scrapeCategory(catObj, allProductsMap) {
  let page = 1;
  let hasProducts = true;
  let lastPageSignature = "";

  while (hasProducts) {
    const pageUrl = page === 1 ? catObj.url : `${catObj.url}?p=${page}`;
    console.log(`  -> Escaneando: ${catObj.category} (Página ${page})...`);

    try {
      const { data } = await axiosInstance.get(pageUrl);
      const $ = cheerio.load(data);

      // Ampliamos los posibles contenedores
      const products = $('.produto, .box-produto, .item-produto, .product-item, li.item');

      if (products.length === 0) {
        hasProducts = false;
        break;
      }

      let currentPageSignature = "";
      products.each((i, el) => {
        // Buscamos cualquier texto que parezca un código MB
        const rawText = $(el).text();
        const skuMatch = rawText.match(/MB\d+/);
        currentPageSignature += skuMatch ? skuMatch[0] : `UNK-${i}`;
      });

      if (currentPageSignature === lastPageSignature) {
        console.log(`  [!] Bucle del servidor detectado.`);
        break;
      }
      lastPageSignature = currentPageSignature;

      // --- NUEVO MODO ASPIRADORA DE DATOS ---
      for (let i = 0; i < products.length; i++) {
        const el = products[i];

        // 1. Extraer SKU (Busca "MBXXXXX" en todo el texto de la tarjeta)
        const rawText = $(el).text();
        const skuMatch = rawText.match(/MB\d+/);
        const sku = skuMatch ? skuMatch[0] : `MB-UNK-${Math.floor(Math.random() * 100000)}`;

        // 2. Extraer Nombre (Toma el texto más largo de la tarjeta quitando el SKU)
        let name = $(el).find('h2, h3, h4, .titulo, .nome, strong').text().trim();
        if (!name) {
          // Fallback: Tomar texto limpio
          name = rawText.replace(sku, '').replace(/\s+/g, ' ').trim().substring(0, 60);
        }

        // 3. Extraer Imagen (Ataca TODOS los atributos posibles de lazy load)
        let imgUrl = $(el).find('img').attr('data-original') ||
          $(el).find('img').attr('data-src') ||
          $(el).find('img').attr('data-lazy-src') ||
          $(el).find('img').attr('src');

        if (imgUrl && !imgUrl.startsWith('http')) imgUrl = BASE_URL + imgUrl;

        // 4. Guardar (Solo pedimos que tenga imagen, el nombre lo forzamos si es necesario)
        if (imgUrl) {
          const localImgName = `${sku}.jpg`.replace(/[^a-zA-Z0-9.-]/g, '');

          if (!allProductsMap.has(sku)) {
            await downloadImage(imgUrl, localImgName);
            allProductsMap.set(sku, {
              id: sku,
              name: name || `Producto ${sku}`,
              image: `/assets/products/${localImgName}`,
              tags: [catObj.category]
            });
          } else {
            const existing = allProductsMap.get(sku);
            if (!existing.tags.includes(catObj.category)) {
              existing.tags.push(catObj.category);
            }
          }
        } else {
          console.log(`    [!] Producto ${sku} omitido: No se detectó URL de imagen.`);
        }
      }
      page++;
      await delay(500); // Lo bajamos a 500ms para que vaya más rápido en esta prueba
    } catch (e) {
      console.log(`  [!] Error de conexión en Pág ${page}.`);
      hasProducts = false;
    }
  }
}

async function run() {
  console.log('=== INICIANDO EXTRACCIÓN PROFUNDA (CRAWLER V14 - ASPIRADORA) ===');
  const categories = await getCategoryLinks();
  const allProductsMap = new Map();

  for (let i = 0; i < categories.length; i++) {
    console.log(`\n[${i + 1}/${categories.length}] Procesando rama: ${categories[i].category}`);
    await scrapeCategory(categories[i], allProductsMap);
    await delay(1500);
  }

  const finalArray = Array.from(allProductsMap.values());
  fs.writeFileSync(DATA_FILE, JSON.stringify(finalArray, null, 2));

  console.log('\n=======================================');
  console.log(`✅ ¡COSECHA FINALIZADA!`);
  console.log(`📦 Total de productos únicos extraídos: ${finalArray.length}`);
  console.log(`💾 Base de datos guardada en: maestra.json`);
  console.log('=======================================');
}

run();