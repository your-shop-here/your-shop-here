
/**
 * Creates a model for the bundle or set products
*
* @param {Object} options - The options object
* @param {Object} options.product - The product object
* @param {Object} options.settings - The settings object
* @returns {Object} The model object
*/
exports.createModel = function createModel(options) {
    const { renderPrice, getImageUrl, renderAddToCartButton } = require('*/cartridge/partials/shared-templates/product-items');
    const product = options.product;
    const recommendations = product.getRecommendations().toArray();
    const model = {
        recommendationTypes: {},
    };

    const groupedRecommendations = {};
    recommendations.forEach((recommendation) => {
        const recommendationType = recommendation.describe().getSystemAttributeDefinition('recommendationType');
        const recommendationTypeDefinition = recommendationType.values.toArray().find((value) => value.value === recommendation.recommendationType);
        const recommendationTypeLabel = recommendationTypeDefinition && recommendationTypeDefinition.getDisplayValue();
        if (!groupedRecommendations[recommendation.recommendationType.toString()]) {
            groupedRecommendations[recommendation.recommendationType.toString()] = { items: [], title: recommendationTypeLabel };
        }
        const item = {
            pid: recommendation.recommendedItem.ID,
            name: recommendation.recommendedItem.name,
            price: renderPrice(recommendation.recommendedItem, options),
            quantity: product.bundle ? product.getBundledProductQuantity(recommendation.recommendedItem).value : 1,
            image: getImageUrl(recommendation.recommendedItem, options),
            addToCartButton: options.settings.showAddToCart ? renderAddToCartButton(recommendation.recommendedItem) : '',
        };
        groupedRecommendations[recommendation.recommendationType.toString()].items.push(item);
    });
    model.recommendationTypes = Object.values(groupedRecommendations);
    return model;
};

/**
 * Renders the bundle or set products
 *
 * @param {Object} model - The model object
 * @returns {string} The rendered HTML
 */
exports.template = (model) => {
    if (!model.recommendationTypes || model.recommendationTypes.length === 0) {
        return '';
    }

    return model.recommendationTypes.map((recommendationType) => require('*/cartridge/partials/shared-templates/product-items').template(recommendationType)).join('');
};
