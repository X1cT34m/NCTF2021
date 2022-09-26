require("dotenv").config();

const puppeteer = require('puppeteer');
const { dequeue } = require('./helper/redis');


const sleep = (delay) => {
    return new Promise(resolve => setTimeout(resolve, delay));
}

const browse = async (url) => {

    console.log(`[+] Checking site: ${url} started`)
    const browser = await puppeteer.launch({
        headless: true,
        args: [
            '--disable-gpu',
            '--disable-dev-shm-usage',
            '--no-sandbox',
            '--js-flags="--noexpose_wasm"',
        ],
        executablePath: 'google-chrome-stable'
    });
    const page = await browser.newPage(); 
    
    try {
        await page.goto(process.env.SITE_URL, {
            waitUntil: "networkidle2",
            timeout: 3000
        });
    
        await page.type('input[name="username"]', process.env.ADMIN_USERNAME)
    
        await Promise.all([
            page.waitForNavigation(), page.click('#submit')
        ]);
        
        await page.goto(url, {
            waitUntil: "networkidle2",
            timeout: 3000
        });

    } catch (err) {
        console.log(err);
    } finally {
        await page.close();
        await browser.close();
    }
    console.log(`[+] Checking site: ${url} finished`)
}

(async () => {
    while (true) {
        try {
            console.log('working');
            let url = await dequeue("urls");
            if (url) {
                await browse(url);
            }
            await sleep(3 * 1000);
        } catch (err) {
            console.log(err);
        }
    }
})();
