/**
 * Create view model for a simple content page
 * @param {dw.experience.ComponentScriptContext} context - The component context, including content and configuration.
 * @returns {Object} The view model containing the product page regionsxx
 */
exports.createModel = (input) => {
    const PageMgr = require('dw/experience/PageMgr');
    const HashMap = require('dw/util/HashMap');
    const modelProducts = input.products.map((product) => {
        const aspectAttributes = new HashMap();
        aspectAttributes.product = product;
        return {
            wainclude: PageMgr.renderPage('product-tile', aspectAttributes, JSON.stringify({ pid: product.ID })),
        };
    });

    const model = { products: modelProducts };

    return model;
};

/**
 * Render a product tile name
 * @param {Object} model - The view model containing product details
 * @returns {string} The HTML template for the product tile name
 */
exports.template = (model) => `${model.products.map((product) => `${product.wainclude}`).join('')}`;
