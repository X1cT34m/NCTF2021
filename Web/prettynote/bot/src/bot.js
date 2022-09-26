const puppeteer = require("puppeteer");
const { dequeue } = require("./redis");

const browser_option = {
    headless: true,
    args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--js-flags="--noexpose_wasm"'
    ],
    executablePath: "google-chrome-stable"
};

const MAIN_SITE = "https://prettynote.bycsec404.top"
const FLAG = "nctf{xss_is_harder_than_rce_23333}"

const sleep = (delay) => {
    return new Promise((resolve) => setTimeout(resolve, delay))
}

async function browse(url) {

    console.log(`[+] browsing ${url} started`)

    const browser = await puppeteer.launch(browser_option);
    const page = await browser.newPage();

    page.on('dialog', async (dialog) => {
        await dialog.dismiss();
    });

    try {
        await page.goto(MAIN_SITE, {
            waitUntil: "networkidle2",
            timeout: 3000
        });

        await page.evaluate((flag) => {
            localStorage.setItem("flag", flag);
        }, FLAG);
        
        await page.goto(url, {
            waitUntil: 'load',
            timeout: 3000
        })

    } catch (err) {
        console.log(err);
    } finally {
        await page.close();
        await browser.close();
    }

    console.log(`[+] browsing ${url} finished`)
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
