const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const https = require('https');

const DATA_FILE = path.join(__dirname, '../public/assets/data/maestra.json');
const IMG_DIR = path.join(__dirname, '../public/assets/products');
const BASE_URL = 'https://magazinebrindes.com.br';

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
            var distance = 400;
            var timer = setInterval(() => {
                var scrollHeight = document.body.scrollHeight;
                window.scrollBy(0, distance);
                totalHeight += distance;
                if (totalHeight >= scrollHeight - window.innerHeight) {
                    clearInterval(timer);
                    resolve();
                }
            }, 150);
        });
    });
}

async function runGlobalSweeper() {
    console.log(`=== 🌎 INICIANDO BARRIDO GLOBAL INTELIGENTE ===`);
    const rawData = fs.readFileSync(DATA_FILE, 'utf8');
    let productsArray = JSON.parse(rawData);
    const allProductsMap = new Map(productsArray.map(p => [p.id, p]));

    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();
    await page.setViewport({ width: 1366, height: 768 });

    // 1. Obtener todas las categorías del menú principal automáticamente
    console.log("[+] Obteniendo mapa de categorías...");
    await page.goto(BASE_URL + '/brindes', { waitUntil: 'networkidle2' });
    const menuHtml = await page.content();
    const $menu = cheerio.load(menuHtml);
    const categories = [];

    $menu('.ul-table li a').each((i, el) => {
        const url = $menu(el).attr('href');
        const name = $menu(el).attr('title') || $menu(el).text().trim();
        if (url && url.includes('/brindes/')) {
            categories.push({ name, url: url.startsWith('http') ? url : BASE_URL + url });
        }
    });

    console.log(`[!] Se detectaron ${categories.length} categorías para procesar.`);

    for (let i = 0; i < categories.length; i++) {
        const cat = categories[i];
        console.log(`\n [${i + 1}/${categories.length}] Procesando: ${cat.name}...`);

        try {
            await page.goto(cat.url, { waitUntil: 'networkidle2', timeout: 60000 });
            await autoScroll(page);
            await new Promise(r => setTimeout(r, 2000));

            const html = await page.content();
            const $ = cheerio.load(html);
            const products = $('.produto, .box-produto, .item-produto, .product-item, li.item');

            // Manejo para categorías de un solo producto (redirección)
            if (products.length === 0 && $('.detalhe-produto').length > 0) {
                console.log(`  - Categoría de producto único detectada.`);
                // Lógica de extracción para página de producto individual...
                // (Se mantiene simple para este barrido)
            }

            let count = 0;
            for (let j = 0; j < products.length; j++) {
                const el = products[j];
                const skuMatch = $(el).text().match(/MB\d+/);
                if (!skuMatch) continue;

                const sku = skuMatch[0].toUpperCase();
                let imgUrl = null;

                // FILTRO DE RAYOS X BASADO EN F12
                $(el).find('img').each((idx, imgEl) => {
                    let tempUrl = $(imgEl).attr('data-original') || $(imgEl).attr('src');
                    if (tempUrl) {
                        const isLabel = /novidade|selo|tarja|queima|estoque/i.test(tempUrl);
                        if (!isLabel && (tempUrl.includes('.jpg') || tempUrl.includes('.png'))) {
                            imgUrl = tempUrl;
                        }
                    }
                });

                if (imgUrl) {
                    const localImgName = `${sku}.jpg`;
                    await downloadImage(imgUrl.startsWith('http') ? imgUrl : BASE_URL + imgUrl, localImgName);

                    if (allProductsMap.has(sku)) {
                        const p = allProductsMap.get(sku);
                        if (!p.tags.includes(cat.name)) p.tags.push(cat.name);
                        p.image = `/assets/products/${localImgName}`;
                    } else {
                        allProductsMap.set(sku, {
                            id: sku,
                            name: $(el).find('h2, h3, .titulo').text().trim() || `Produto ${sku}`,
                            image: `/assets/products/${localImgName}`,
                            tags: [cat.name]
                        });
                    }
                    count++;
                }
            }
            console.log(`  ✅ Procesados ${count} productos en esta categoría.`);

            // Guardar progreso cada 5 categorías para seguridad
            if (i % 5 === 0) {
                fs.writeFileSync(DATA_FILE, JSON.stringify(Array.from(allProductsMap.values()), null, 2));
            }
        } catch (err) {
            console.log(`  ❌ Error: ${err.message}`);
        }
    }

    await browser.close();
    fs.writeFileSync(DATA_FILE, JSON.stringify(Array.from(allProductsMap.values()), null, 2));
    console.log(`\n=== 🏆 BARRIDO GLOBAL FINALIZADO CON ÉXITO ===`);
}

runGlobalSweeper();