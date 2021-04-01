const puppeteer = require('puppeteer');

module.exports = {

    extract: async (facebookURL) => {

        const facebook = {};

        const browser = await puppeteer.launch();

        const page = await browser.newPage();

        const userAgent = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/64.0.3282.39 Safari/537.36';
        await page.setUserAgent(userAgent);

        const reviewsURL = facebookURL + "/reviews";

        console.log(`Extracting from ${reviewsURL}...`);

        await page.goto(reviewsURL);

        const reviewsScraping = await page.evaluate(() => {

            const data = {};
            const comments = [];

            // Comments
            const commentElements = document.querySelectorAll('._5pbx p');
            for (let item of commentElements) {
                comments.push(item.textContent);
            };
            data.comments = comments;

            // Rating
            const rating = document.querySelectorAll('._1f47');
            for (let item of rating) {
                data.rating = item.textContent;
            };

            return data;
        });

        facebook.reviews = reviewsScraping;

        const communityURL = facebookURL + "/community/?ref=page_internal";

        console.log(`Extracting from ${communityURL}...`);

        await page.goto(communityURL);

        let site = facebookURL.split('/')[3];
        site = (site.indexOf('?') > -1) ? site.substring(0, site.indexOf('?')) : site;

        const localHref = `/${site}/community/?ref=page_internal`;

        console.log(`Clicking ${localHref}...`);

        await page.click(`a[href='${localHref}']`);

        const communityScraping = await page.evaluate(() => {

            const community = {};

            let items = document.querySelectorAll('._3xoj > ._3xom');

            if (items && (items.length > 0)) {
                community.likes = (items[0]) ? items[0].innerHTML.replace('&nbsp;', ' ').replace(/[^0-9]/g, '') : '';
                community.follows = (items[1]) ? items[1].innerHTML.replace('&nbsp;', ' ').replace(/[^0-9]/g, '') : '';
            } else {
                items = document.getElementsByClassName('_2pi9 _2pi2');
                community.likes = (items[0]) ? items[0].querySelector('._4bl9 div').innerHTML.replace(/[^0-9]/g, '') : '';
                community.follows = (items[1]) ? items[1].querySelector('._4bl9 div').innerHTML.replace(/[^0-9]/g, '') : '';
            }

            return community;
        });

        facebook.community = communityScraping;

        await browser.close();

        return facebook;
    }
}
