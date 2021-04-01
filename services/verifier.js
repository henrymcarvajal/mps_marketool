const secure = require('./secure/secure.site');
const registrar = require('./registrar/registrar.main');
const social = require('./social/social.main');
const facebook = require('./social/networks/facebook');
const rater = require('./rating/rater');

module.exports = {
    verify: async (req, res, next) => {

        console.log('Verifying site... ' + req.body.site);

        const site = req.body.site;

        if (site) {

            try {

                const siteDetails = {};
                siteDetails.site = req.body.site;

                try {

                    let secureUrl;
                    let nonSecureUrl;

                    try {
                        secureUrl = new URL('https://' + site);
                        nonSecureUrl = new URL('http://' + site);
                    } catch (error) {
                        console.log(error);
                        console.log(`Done: Bad request (400): ${site}`);
                        return res.status(400).json({ error: `invalid URL: ${site}` });
                    }

                    console.log(`Expanding to ${secureUrl}...`);

                    siteDetails.secure = await secure.verify(secureUrl);

                    let url = siteDetails.secure ? secureUrl : nonSecureUrl;

                    siteDetails.registry = await registrar.extract(url);

                    siteDetails.socialNetworks = await social.extract(url);
                    if (siteDetails.socialNetworks && siteDetails.socialNetworks.facebook) {
                        const facebookData = await facebook.extract(siteDetails.socialNetworks.facebook);
                        if (facebookData) {
                            siteDetails.facebook = facebookData;
                        }
                    }

                    const siteRating = rater.score(siteDetails);

                    console.log(`Done: OK (200)`);

                    res.render('index', { siteDetails: siteDetails, siteRating: siteRating });

                } catch (error) {
                    console.log(error);
                    console.log(`Done: Internal Server Error (500): ${error.message}: ${error.stack}`);
                    return res.status(500).json({ error: `${error.message}: ${error.stack}` });
                }

            } catch (error) {
                console.log(error);
                console.log(`Done: Internal server error (500): ${error.message} ${error.stack}`);
                return res.status(500).json({ error: `${error.message}: ${error.stack}` });
            }

        } else {
            console.log(`Done: Bad request - 400`);
            return res.status(400).json({ error: 'missing URL' });
        }
    }
}
