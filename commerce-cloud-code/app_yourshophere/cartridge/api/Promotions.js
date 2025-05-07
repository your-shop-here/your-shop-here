/**
 * @module app_yourshophere/cartridge/api/Promotions
 * @description API for managing costly promotions operations and caching results across the request lifecycle
 */

const PromotionMgr = require('dw/campaign/PromotionMgr');

let cachedPromotionPlan = null;

/**
 * Gets the active customer promotions with caching
 * @returns {Object} The active customer promotions
 */
const getActiveCustomerPromotions = () => {
    if (!cachedPromotionPlan) {
        cachedPromotionPlan = PromotionMgr.getActiveCustomerPromotions();
    }
    return cachedPromotionPlan;
};

/**
 * Gets product promotions for a given product
 * @param {Object} product - The product object
 * @returns {Array} Array of product promotions
 */
const getProductPromotions = (product) => getActiveCustomerPromotions().getProductPromotions(product).toArray();

module.exports = {
    getActiveCustomerPromotions,
    getProductPromotions,
};
