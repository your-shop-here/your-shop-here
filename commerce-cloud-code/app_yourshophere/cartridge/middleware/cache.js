
/**
 * Applies the default expiration value for the page cache.
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {Function} next - Next call in the middleware chain
 * @returns {void}
*/
function applyDefaultCache(req, res, next) {
    res.cachePeriod = 24; // eslint-disable-line no-param-reassign
    res.cachePeriodUnit = 'hours'; // eslint-disable-line no-param-reassign
    applyToResponse(res);
    next();
}

/**
 * Applies the default price promotion page cache.
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {Function} next - Next call in the middleware chain
 * @returns {void}
*/
function applyPromotionSensitiveCache(req, res, next) {
    res.cachePeriod = 24; // eslint-disable-line no-param-reassign
    res.cachePeriodUnit = 'hours'; // eslint-disable-line no-param-reassign
    res.personalized = true; // eslint-disable-line no-param-reassign
    applyToResponse(res);
    next();
}

/**
 * Applies the default price promotion page cache.
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {Function} next - Next call in the middleware chain
 * @returns {void}
 */
function applyShortPromotionSensitiveCache(req, res, next) {
    res.cachePeriod = 1; // eslint-disable-line no-param-reassign
    res.cachePeriodUnit = 'hours'; // eslint-disable-line no-param-reassign
    res.personalized = true; // eslint-disable-line no-param-reassign
    applyToResponse(res);
    next();
}

/**
 * Applies the inventory sensitive page cache.
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {Function} next - Next call in the middleware chain
 * @returns {void}
*/
function applyInventorySensitiveCache(req, res, next) {
    res.cachePeriod = 30; // eslint-disable-line no-param-reassign
    res.cachePeriodUnit = 'minutes'; // eslint-disable-line no-param-reassign
    applyToResponse(res);
    next();
}

function applyToResponse(res) {
    const currentTime = new Date();
    if (res.cachePeriodUnit && res.cachePeriodUnit === 'minutes') {
        currentTime.setMinutes(currentTime.getMinutes() + res.cachePeriod);
    } else {
        // default to hours
        currentTime.setHours(currentTime.getHours() + res.cachePeriod);
    }
    response.setExpires(currentTime);
}

module.exports = {
    applyDefaultCache,
    applyPromotionSensitiveCache,
    applyInventorySensitiveCache,
    applyShortPromotionSensitiveCache,
};
