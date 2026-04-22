const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const https = require('https');

const IMG_DIR = path.join(__dirname, '../public/assets/products');
const BASE_URL = 'https://magazinebrindes.com.br';

// 🛡️ LISTA NEGRA: Categorías que ya están perfectas y no queremos tocar
const CATEGORIES_TO_SKIP = ['Camisetas', 'Agendas', 'Cadernos', 'Novedades'];

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

async function runMasterCleaner() {
    console.log(`=== 🌀 INICIANDO MASTER-AUTO-CLEANER (MODO AUTOMÁTICO TOTAL) ===`);
    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();
    await page.setViewport({ width: 1366, height: 768 });

    // 1. OBTENER TODAS LAS CATEGORÍAS
    console.log(`[+] Obteniendo mapa de categorías...`);
    await page.goto(BASE_URL + '/brindes', { waitUntil: 'networkidle2' });
    const categories = await page.evaluate((skipList) => {
        const links = Array.from(document.querySelectorAll('.ul-table li a'));
        return links
            .map(a => ({ name: a.title || a.innerText.trim(), url: a.href }))
            .filter(cat => cat.url.includes('/brindes/') && !skipList.some(skip => cat.name.includes(skip)));
    }, CATEGORIES_TO_SKIP);

    console.log(`[!] Se detectaron ${categories.length} categorías para patrullar.`);

    for (const cat of categories) {
        console.log(`\n--- 🕵️ PATRULLANDO: ${cat.name} ---`);
        await page.goto(cat.url, { waitUntil: 'networkidle2' });

        // Scroll para cargar todos los productos de la categoría
        await page.evaluate(async () => {
            await new Promise(resolve => {
                let totalHeight = 0;
                let distance = 400;
                let timer = setInterval(() => {
                    window.scrollBy(0, distance);
                    totalHeight += distance;
                    if (totalHeight >= document.body.scrollHeight) {
                        clearInterval(timer);
                        resolve();
                    }
                }, 200);
            });
        });

        // 2. IDENTIFICAR PRODUCTOS "SUCIOS" (CON ETIQUETA)
        const dirtyProducts = await page.evaluate(() => {
            const items = Array.from(document.querySelectorAll('.box-produto, .produto'));
            return items
                .filter(item => item.querySelector('.img-splash')) // Buscamos la etiqueta naranja/roja
                .map(item => {
                    const link = item.querySelector('a');
                    const skuMatch = item.innerText.match(/MB\d+/i);
                    return {
                        url: link ? link.href : null,
                        sku: skuMatch ? skuMatch[0].toUpperCase() : null
                    };
                })
                .filter(p => p.url && p.sku);
        });

        console.log(`  [*] Se encontraron ${dirtyProducts.length} productos con etiquetas.`);

        // 3. INFILTRACIÓN EN CADA PRODUCTO SUCIO
        for (const prod of dirtyProducts) {
            console.log(`    🚀 Limpiando ${prod.sku}...`);
            try {
                const detailPage = await browser.newPage();
                await detailPage.goto(prod.url, { waitUntil: 'networkidle2', timeout: 30000 });

                const imgUrl = await detailPage.evaluate((skuCode) => {
                    const allImgs = Array.from(document.querySelectorAll('img'));
                    const target = allImgs.find(img =>
                        img.src.toLowerCase().includes(skuCode.toLowerCase()) &&
                        (img.width > 200 || img.naturalWidth > 200)
                    );
                    return target ? target.src : null;
                }, prod.sku);

                if (imgUrl) {
                    await downloadImage(imgUrl, `${prod.sku}.jpg`);
                    console.log(`      [✅] ${prod.sku} saneado.`);
                }
                await detailPage.close();
            } catch (e) {
                console.log(`      [❌] Falló la limpieza de ${prod.sku}: ${e.message}`);
            }
        }
    }

    await browser.close();
    console.log(`\n=== 🏆 EL CATÁLOGO ESTÁ COMPLETAMENTE SANEADO ===`);
}

runMasterCleaner();