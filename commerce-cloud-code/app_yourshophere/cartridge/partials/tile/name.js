/**
 * Create view model for a product tile name
 * @param {dw.catalog.SearchHit} hit - The search hit containing product information
 * @returns {Object} The view model containing product details
 */
exports.createModel = (input) => {
    const URLUtils = require('dw/web/URLUtils');
    const model = input.model;
    const hit = model.hit;
    return {
        pdpUrl: URLUtils.url('Product-Show', 'pid', model.hit.productId),
        pdpUrlHx: URLUtils.url('Product-Show', 'pid', hit.productId).append('hx', 'main'),
        name: hit.name,
    };
};

/**
 * Render a product tile name
 * @param {Object} model - The view model containing product details
 * @returns {string} The HTML template for the product tile name
 */
exports.template = (model) => `<a href="${model.pdpUrl}"
    hx-push-url="${model.pdpUrl}" 
    hx-get="${model.pdpUrlHx}"
    hx-target="main" 
    hx-indicator=".progress">${model.name}</a>`;
