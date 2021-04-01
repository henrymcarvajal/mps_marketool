const puppeteer = require('puppeteer');

module.exports = {

    extract: async (siteURL) => {
        const socialNetworks = { facebook: 'facebook', instagram: 'instagram', twitter: 'twitter' };

        const browser = await puppeteer.launch();
        const page = await browser.newPage();

        const userAgent = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/64.0.3282.39 Safari/537.36';
        await page.setUserAgent(userAgent);

        let siteSocialNetworks;

        try {

            await page.goto(siteURL);

            siteSocialNetworks = await page.evaluate((socialNetworks) => {

                const socialLinks = {};

                for (const [key, value] of Object.entries(socialNetworks)) {
                    const links = document.querySelectorAll(`a[href*="${value}"]`);
                    for (let link of links) {
                        socialLinks[key] = link.href;
                    };
                }

                return socialLinks;

            }, socialNetworks);

        } catch (error) {

            console.log(error);
            
        } finally {

            await page.close();

            await browser.close();
        }

        return siteSocialNetworks;
    }
}
