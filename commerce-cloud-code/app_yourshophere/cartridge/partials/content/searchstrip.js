/**
 * Create view model for a simple content page
 * @param {dw.experience.ComponentScriptContext} context - The component context, including content and configuration.
 * @returns {Object} The view model containing the product page regionsxx
 */
exports.createModel = (input) => {
    const URLUtils = require('dw/web/URLUtils');
    const modelProducts = input.products.map((product) => {
        const url = URLUtils.url('Tile-Show');
        url.append('pid', product.ID);
        return {
            tileUrl: url.toString(),
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
exports.template = (model) => `${model.products.map((product) => `<wainclude url="${product.tileUrl}"/>`).join('')}`;
