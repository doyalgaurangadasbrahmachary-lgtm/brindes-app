const axios = require('axios');
const cheerio = require('cheerio');
const https = require('https');

const axiosInstance = axios.create({
  httpsAgent: new https.Agent({ rejectUnauthorized: false }),
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  }
});

async function run() {
  try {
    const { data } = await axiosInstance.get('https://magazinebrindes.com.br/brindes/mochilas/');
    const $ = cheerio.load(data);
    let firstProductUrl = null;
    $('a').each((i, el) => {
      const href = $(el).attr('href');
      if (href && href.includes('/produto/')) {
        firstProductUrl = href;
        return false;
      }
    });

    if (!firstProductUrl) {
       console.log("No product URL found!");
       return;
    }
    
    if (!firstProductUrl.startsWith('http')) {
      firstProductUrl = 'https://magazinebrindes.com.br' + firstProductUrl;
    }
    console.log("Found product URL:", firstProductUrl);

    const detailResp = await axiosInstance.get(firstProductUrl);
    const $d = cheerio.load(detailResp.data);

    const text = $d('body').text().toLowerCase();
    if (text.includes('cor')) {
       console.log("The string 'cor' was found in the body!");
       // Let's print out the HTML of the main container
       console.log("DUMPING INFO CONTAINER:");
       console.log($d('html').html().substring(0, 1000));
    }
    
    console.log("===============================");
    // try to find standard divs
    console.log("Looking for cores/colors...");
    // Let's just find paragraph or div with the text "cor" or "cores"
    $d('*').each((i, el) => {
        const elText = $d(el).text().toLowerCase().trim();
        if (elText === 'cores' || elText === 'cor') {
            console.log("FOUND matching element!");
            console.log($d(el).parent().html());
        }
    });

  } catch (error) {
    console.error('Error fetching', error.message);
  }
}

run();
