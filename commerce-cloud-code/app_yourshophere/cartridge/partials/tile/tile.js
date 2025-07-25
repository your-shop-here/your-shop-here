/**
 * Create the view model for the tile
 * @param {Object} input - The input object containing the model
 * @returns {Object} The view model containing the model
 */
exports.createModel = function createModel(input) {
    return input.model;
};

/**
 * Render the tile
 * @param {Object} model - The view model containing the model
 * @returns {string} The HTML template for the tile
 */
exports.template = (model) => `
<article class="product-tile" data-include-url="${request.httpQueryString}" data-analytics='${model.analytics}' data-analytics-contribution='${model.analyticsContribution}'>
    ${model.regions.tileHeader.setTagName('header').setComponentTagName('custom-container').render()}
    ${model.regions.tileBody.setTagName('body').setComponentTagName('custom-container').render()}
    ${model.regions.tileFooter.setTagName('footer').setComponentTagName('custom-container').render()}
</article>`;
