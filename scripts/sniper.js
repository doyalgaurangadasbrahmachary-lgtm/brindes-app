const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const https = require('https');

const DATA_FILE = path.join(__dirname, '../src/data/maestra.json');
const IMG_DIR = path.join(__dirname, '../public/assets/products');
const BASE_URL = 'https://magazinebrindes.com.br';

// 🎯 CONFIGURACIÓN DE PRUEBA: CATEGORÍA CAMISETAS
const TARGET_URL = 'https://magazinebrindes.com.br/brindes/Camisetas';
const TARGET_CATEGORY = 'Camisetas';

const axiosInstance = axios.create({
    httpsAgent: new https.Agent({ rejectUnauthorized: false }),
    headers: { 'User-Agent': 'Mozilla/5.0' }
});

async function downloadImage(url, filename) {
    const filepath = path.join(IMG_DIR, filename);
    try {
        const response = await axiosInstance({ url, responseType: 'stream' });
        return new Promise((resolve, reject) => {
            const writer = fs.createWriteStream(filepath);
            response.data.pipe(writer);
            writer.on('finish', () => resolve(filename));
            writer.on('error', reject);
        });
    } catch (error) { return null; }
}

async function autoScroll(page) {
    await page.evaluate(async () => {
        await new Promise((resolve) => {
            var totalHeight = 0;
            var distance = 250;
            var timer = setInterval(() => {
                var scrollHeight = document.body.scrollHeight;
                window.scrollBy(0, distance);
                totalHeight += distance;
                if (totalHeight >= scrollHeight - window.innerHeight) {
                    clearInterval(timer);
                    resolve();
                }
            }, 300); // Scroll lento para simular carga humana
        });
    });
}

async function runSniperV3() {
    console.log(`=== 🎯 SNIPER V3: EXTRACCIÓN LIMPIA (data-src1) EN: ${TARGET_CATEGORY} ===`);

    if (!fs.existsSync(DATA_FILE)) {
        console.log("❌ Error: No se encontró el archivo maestra.json");
        return;
    }

    const rawData = fs.readFileSync(DATA_FILE, 'utf8');
    let productsArray = JSON.parse(rawData);
    const allProductsMap = new Map(productsArray.map(p => [p.id, p]));

    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();
    await page.setViewport({ width: 1366, height: 768 });

    console.log(`[+] Accediendo a: ${TARGET_URL}`);
    await page.goto(TARGET_URL, { waitUntil: 'networkidle2', timeout: 0 });

    console.log(`[+] Realizando scroll para activar Lazy Load e inyectar atributos...`);
    await autoScroll(page);

    // ESPERA CRÍTICA: 5 segundos para que data-src1 se cargue en el DOM
    await new Promise(r => setTimeout(r, 5000));

    const html = await page.content();
    const $ = cheerio.load(html);
    const products = $('.produto, .box-produto, .item-produto, .product-item, li.item');

    console.log(`[*] Se detectaron ${products.length} productos en el HTML.`);

    let fixed = 0;
    for (let i = 0; i < products.length; i++) {
        const el = products[i];
        const skuMatch = $(el).text().match(/MB\d+/);
        if (!skuMatch) continue;

        const sku = skuMatch[0].toUpperCase();

        // 🕵️ ESTRATEGIA DE PRIORIDAD BASADA EN F12:
        // Buscamos primero en 'data-src1', que contiene la versión sin etiquetas naranja/roja.
        const imgTag = $(el).find('img.lazy');
        let imgUrl = imgTag.attr('data-src1') || imgTag.attr('data-original') || imgTag.attr('src');

        // Forzamos el uso de data-src1 si existe, ya que es nuestra imagen limpia confirmada
        if (imgTag.attr('data-src1')) {
            imgUrl = imgTag.attr('data-src1');
        }

        if (imgUrl) {
            const localImgName = `${sku}.jpg`;
            const finalUrl = imgUrl.startsWith('http') ? imgUrl : BASE_URL + imgUrl;

            // Sobrescribimos la imagen actual con la versión capturada de data-src1
            const success = await downloadImage(finalUrl, localImgName);

            if (success && allProductsMap.has(sku)) {
                allProductsMap.get(sku).image = `/assets/products/${localImgName}`;
                fixed++;
                console.log(`  [✅] Saneado: ${sku}`);
            }
        }
    }

    await browser.close();
    fs.writeFileSync(DATA_FILE, JSON.stringify(Array.from(allProductsMap.values()), null, 2));

    console.log('\n=======================================');
    console.log(`✅ MISIÓN COMPLETADA EN: ${TARGET_CATEGORY}`);
    console.log(`📸 Imágenes actualizadas con versión limpia (data-src1): ${fixed}`);
    console.log('=======================================');
}

runSniperV3();