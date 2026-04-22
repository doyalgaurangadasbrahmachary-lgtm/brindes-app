const axios = require('axios');
const cheerio = require('cheerio');
const https = require('https');

const axiosInstance = axios.create({
  httpsAgent: new https.Agent({ rejectUnauthorized: false }),
  headers: {
    'User-Agent': 'Mozilla/5.0'
  }
});

async function checkSitemap() {
    try {
        console.log("Comprobando sitemap...");
        let { data } = await axiosInstance.get('https://magazinebrindes.com.br/sitemap.xml');
        console.log("Longitud del sitemap:", data.length);
        console.log(data.substring(0, 500));
    } catch(e) {
        console.error("Error sitemap:", e.message);
    }
}
checkSitemap();
