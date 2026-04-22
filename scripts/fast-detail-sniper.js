const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const https = require('https');

const IMG_DIR = path.join(__dirname, '../public/assets/products');

const PRODUCT_URLS = [
    'https://magazinebrindes.com.br/brinde/Caderno-de-bolso-de-capa-dura-9-0-x-14-2-mb93657-34079',
    'https://magazinebrindes.com.br/brinde/Caderno-A5-de-capa-dura-em-PET-mb93653-34078',
    'https://magazinebrindes.com.br/brinde/Caderno-A5-com-capa-em-feltro-100-reciclado-mb93636-34071',
    'https://magazinebrindes.com.br/brinde/Caderno-A5-de-capa-semi-rigida-mb93635-34070',
    'https://magazinebrindes.com.br/brinde/Caderno-A5-com-capa-dura-MB53654-33957',
    'https://magazinebrindes.com.br/brinde/Caderno-de-bolso-de-capa-dura-14-0-x-9-0-MB53425-33936',
    'https://magazinebrindes.com.br/brinde/Caderno-A7-de-capa-rigida-MB53422-33928',
    'https://magazinebrindes.com.br/brinde/Caderno-20-7x14-6-MB03638-32348',
    'https://magazinebrindes.com.br/brinde/Caderno-21x15-4-MB03637-32341',
    'https://magazinebrindes.com.br/brinde/Caderno-21-3x15-8-MB03636-32334',
    'https://magazinebrindes.com.br/brinde/Caderno-de-Anotacoes-20-6-x-13-0-MB03595-31973',
    'https://magazinebrindes.com.br/brinde/Caderno-DYNAMIC-15-0-x-21-0-mb53634-31360',
    'https://magazinebrindes.com.br/brinde/Caderno-A5-de-capa-dura-100-rPET-pautado-14-8-x-21-2-MB93586-31185',
    'https://magazinebrindes.com.br/brinde/Caderno-A5-pautado-reciclado-14-5-x-20-5-mb93587-31184',
    'https://magazinebrindes.com.br/brinde/Caderno-A5-pautado-reciclado-14-5-x-20-5-mb93622-31183',
    'https://magazinebrindes.com.br/brinde/Caderno-A5-com-folhas-pautadas-14-5-x-20-5-mb93623-31182'
];

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

async function runFastSniperV2() {
    console.log(`=== ⚡ INICIANDO FAST-DETAIL-SNIPER V2 (SMART SEARCH) ===`);
    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();
    await page.setViewport({ width: 1366, height: 768 });

    for (const url of PRODUCT_URLS) {
        const skuMatch = url.match(/MB\d+/i);
        if (!skuMatch) continue;
        const sku = skuMatch[0].toUpperCase();

        console.log(`\n🚀 Infiltrando en: ${sku}...`);

        try {
            await page.goto(url, { waitUntil: 'networkidle2', timeout: 45000 });

            // Espera de seguridad para que carguen los scripts de la página
            await new Promise(r => setTimeout(r, 3000));

            // 🕵️ ESTRATEGIA DE BÚSQUEDA GLOBAL POR SKU
            const imgUrl = await page.evaluate((skuCode) => {
                const allImages = Array.from(document.querySelectorAll('img'));
                // Buscamos una imagen que contenga el SKU en su ruta y no sea un icono minúsculo
                const target = allImages.find(img =>
                    img.src.toLowerCase().includes(skuCode.toLowerCase()) &&
                    (img.width > 200 || img.naturalWidth > 200)
                );
                return target ? target.src : null;
            }, sku);

            if (imgUrl) {
                console.log(`  [✨] ¡Imagen encontrada por coincidencia de SKU!`);
                await downloadImage(imgUrl, `${sku}.jpg`);
                console.log(`  [✅] ${sku}.jpg actualizado.`);
            } else {
                console.log(`  [❌] Ni siquiera la búsqueda por SKU encontró la imagen.`);
            }

        } catch (err) {
            console.log(`  [❌] Error en ${sku}: ${err.message}`);
        }
    }

    await browser.close();
    console.log(`\n=== 🏆 OPERACIÓN FINALIZADA ===`);
}

runFastSniperV2();