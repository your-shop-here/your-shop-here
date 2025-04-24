/**
 * Creates a model for product promotions display
 * @param {Object} options - The options object containing product information
 * @param {Object} options.product - The product to get promotions for
 * @returns {Object} Model containing an array of promotion messages to display
 */
exports.createModel = function createModel(options) {
    const Promotions = require('*/cartridge/api/Promotions');
    const promotions = Promotions.getProductPromotions(options.product);
    const model = {
        promotions: promotions.map((promotion) => ({
            message: promotion.getCalloutMsg(),
        })),
    };

    return model;
};

/**
 * Renders the promotions as an HTML unordered list
 * @param {Object} model - The model containing promotion messages
 * @param {Array<Object>} model.promotions - Array of promotion objects
 * @param {string} model.promotions[].message - The promotion message to display
 * @returns {string} HTML string containing the promotions list
 */
exports.template = (model) => `<ul>
    ${model.promotions.map((promotion) => `<li>${promotion.message}</li>`).join('\n')}
</ul>`;
