const HAS_SSL_SITE_RATING = 50;
const DOMAIN_CREATION_DATE_RATING = 10;
const DOMAIN_CREATION_MONTHS_DIFF = 24; // 2 años
const HAS_SOCIAL_NETWORKS_RATING = 10;
const FACEBOOK_RATING_RATING = 15;
const FACEBOOK_LIKES_RATING = 15;
const FACEBOOK_MAXIMUM_RATING = 5;
const FACEBOOK_MINIMUM_LIKES = 700;

const DECIMAL_POSITIONS = 2;

function monthDiff(dateFrom, dateTo) {
    return dateTo.getMonth() - dateFrom.getMonth() +
        (12 * (dateTo.getFullYear() - dateFrom.getFullYear()))
}

function round(number, positions) {
    return Math.round((number + Number.EPSILON) * (10 * positions) / (10 * positions));
}

module.exports = {

    score: (siteDetails) => {
        let totalRating = 0;

        if (siteDetails.secure) {
            totalRating += HAS_SSL_SITE_RATING;
        }

        if (siteDetails.registry) {
            if (siteDetails.registry["Domain Information"]) {
                if (siteDetails.registry["Domain Information"]["Registered On"]) {
                    const registrationDateMillis = Date.parse(siteDetails.registry["Domain Information"]["Registered On"]);
                    const registrationDate = new Date(registrationDateMillis);
                    const now = new Date();

                    const diff = monthDiff(registrationDate, now);
                    
                    if (diff > DOMAIN_CREATION_MONTHS_DIFF) {
                        totalRating += DOMAIN_CREATION_DATE_RATING;
                    } else {
                        const creationDateScore = round((DOMAIN_CREATION_DATE_RATING * diff) / DOMAIN_CREATION_MONTHS_DIFF, DECIMAL_POSITIONS);
                        totalRating += creationDateScore;
                    }
                }
            }
        }

        if (siteDetails.socialNetworks) {
            if (siteDetails.socialNetworks.facebook) {
                totalRating += HAS_SOCIAL_NETWORKS_RATING / 2;

                if (siteDetails.facebook.reviews.rating) {
                    const ratingScore = round((FACEBOOK_RATING_RATING * parseFloat(siteDetails.facebook.reviews.rating)) / FACEBOOK_MAXIMUM_RATING, DECIMAL_POSITIONS);
                    totalRating += ratingScore;
                }

                if (siteDetails.facebook.community.follows) {

                    if (siteDetails.facebook.community.follows > FACEBOOK_MINIMUM_LIKES) {
                        totalRating += FACEBOOK_LIKES_RATING;
                    } else {
                        const followsScore = round((DOMAIN_CREATION_DATE_RATING * siteDetails.facebook.community.follows) / FACEBOOK_MINIMUM_LIKES, DECIMAL_POSITIONS);
                        totalRating += followsScore;
                    }
                }
            }

            if (siteDetails.socialNetworks.instagram) {
                totalRating += HAS_SOCIAL_NETWORKS_RATING / 2;
            }
        }

        return totalRating;
    }
}
