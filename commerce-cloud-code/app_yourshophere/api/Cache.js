/**
 * Sets cache expiration in hours
 * @param {number} hours - Number of hours to cache
 */
exports.hours = function (hours) {
    const now = new Date();
    const expires = new Date(now.getTime() + (hours * 60 * 60 * 1000));
    response.setExpires(expires);
};

/**
 * Sets cache expiration in minutes
 * @param {number} minutes - Number of minutes to cache
 */
exports.minutes = function (minutes) {
    const now = new Date();
    const expires = new Date(now.getTime() + (minutes * 60 * 1000));
    response.setExpires(expires);
};

/**
 * Sets cache expiration in days
 * @param {number} days - Number of days to cache
 */
exports.days = function (days) {
    const now = new Date();
    const expires = new Date(now.getTime() + (days * 24 * 60 * 60 * 1000)); 
    response.setExpires(expires);
};

