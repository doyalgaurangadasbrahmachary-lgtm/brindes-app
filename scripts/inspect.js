const axios = require('axios');
const cheerio = require('cheerio');
const https = require('https');

const axiosInstance = axios.create({
  httpsAgent: new https.Agent({ rejectUnauthorized: false }),
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  }
});

async function inspect() {
  try {
    const { data } = await axiosInstance.get('https://magazinebrindes.com.br/brindes');
    const $ = cheerio.load(data);
    // Log the first link that has a 'MB' product code or similar, or just dump image parents
    const firstImg = $('img').first().parent().parent();
    console.log($.html(firstImg));
  } catch (error) {
    console.error('Error fetching page', error.message);
  }
}

inspect();
