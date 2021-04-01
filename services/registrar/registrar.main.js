const puppeteer = require('puppeteer');
const puppeteerConfig = require('../puppeteer.config');

const whoIsUrl = 'https://www.whois.com/whois/';

module.exports = {

    extract: async (site) => {

        const browser = await puppeteer.launch(puppeteerConfig.puppetterHerokuLaunch);
        const page = await browser.newPage();

        const userAgent = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/64.0.3282.39 Safari/537.36';
        await page.setUserAgent(userAgent);

        const registrarURL = whoIsUrl + site;

        await page.goto(registrarURL);

        const registrarData = await page.evaluate(() => {

            const registrar = {};
            const data = document.querySelectorAll('.df-block');

            for (let datum of data) {
                const header = datum.querySelector('.df-heading');

                const values = {};
                const rows = datum.querySelectorAll('.df-row');

                for (let row of rows) {
                    const key = row.querySelector('.df-label').textContent.replace(':', '');
                    const value = row.querySelector('.df-value').innerHTML;
                    values[key] = (value.search('<br>') > -1) ? value.split('<br>') : value;
                }

                registrar[header.textContent] = values;
            }

            return registrar;

        });

        await browser.close();

        return registrarData;
    }
}
