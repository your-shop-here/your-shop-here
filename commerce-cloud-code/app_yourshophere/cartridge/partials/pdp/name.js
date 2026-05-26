exports.createModel = function createModel(product) {
    return {
        name: product.name,
    };
};

/**
 * Renders a Product Description Component
 *
 * @param {dw.experience.ComponentScriptContext} context The component context
 * @returns {string} The template to be displayed
 */
exports.template = (model) => `<h1 class="product-name">${model.name}</h1>`;
