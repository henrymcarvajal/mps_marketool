const puppeteer = require('puppeteer');
const puppeteerConfig = require('../puppeteer.config');

module.exports = {

    verify: async (siteURL) => {

        const browser = await puppeteer.launch({
            args: [
              '--no-sandbox',
              '--disable-setuid-sandbox',
            ],
          });
        const page = await browser.newPage();

        const userAgent = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/64.0.3282.39 Safari/537.36';
        await page.setUserAgent(userAgent);

        let secureContents = true;

        try {

            await page.goto(siteURL);

        } catch (error) {

            if (error.toString().includes('ERR_CERT_COMMON_NAME_INVALID')) {
                secureContents = false;
            }

        } finally {

            await page.close();

            await browser.close();
        }

        return secureContents;
    }
}
