
exports.createModel = function createModel(input) {
    return input.model;
};

/**
 * Render the add to cart button
 * @param {Object} model - The view model containing product details
 * @returns {string} The HTML template for the add to cart button
 */
exports.template = (model) => `
<article data-include-url="${request.httpQueryString}" data-analytics='${model.analytics}' data-analytics-contribution='${model.analyticsContribution}'>
    ${model.regions.tileHeader.setTagName('header').setComponentTagName('custom-deleteme').render()}
    ${model.regions.tileBody.setTagName('body').setComponentTagName('custom-deleteme').render()}
    ${model.regions.tileFooter.setTagName('footer').setComponentTagName('custom-deleteme').render()}
</article>`;
