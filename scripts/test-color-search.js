const axios = require('axios');
const cheerio = require('cheerio');
const https = require('https');

const axiosInstance = axios.create({
  httpsAgent: new https.Agent({ rejectUnauthorized: false }),
  headers: {
    'User-Agent': 'Mozilla/5.0'
  }
});

async function testSearchBySku(sku) {
    try {
        const url = `https://magazinebrindes.com.br/busca/?q=${sku}`;
        console.log(`Buscando URL: ${url}`);
        const { data } = await axiosInstance.get(url);
        const $ = cheerio.load(data);
        
        let foundLinks = [];
        $('a').each((i, el) => {
           let href = $(el).attr('href');
           if (href && (href.includes('/brinde/') || href.includes('/produto/'))) {
               foundLinks.push(href);
           }
        });
        
        console.log("Enlaces de productos encontrados en la búsqueda:");
        console.log([...new Set(foundLinks)]);
        
    } catch (e) {
        console.error("Error:", e.message);
    }
}

testSearchBySku('MB03874');
