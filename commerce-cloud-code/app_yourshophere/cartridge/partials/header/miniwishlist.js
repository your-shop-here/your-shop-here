/**
 * Creates the model for the mini wishlist include
 * @returns {Object} The model for the mini wishlist include
 */
function createModel(input) {
    const URLUtils = require('dw/web/URLUtils');
    const model = {
        imageHtml: input.imageHtml,
        miniWishListIncludeUrl: URLUtils.url('Components-MiniWishlist'),
    };
    return model;
}

/**
 * Renders the mini wishlist include
 * @param {Object} model - The model for the mini wishlist include
 * @returns {string} The HTML for the mini wishlist include
 */
function template(model) {
    return `${model.imageHtml}<wainclude url="${model.miniWishListIncludeUrl}"/>`;
}

module.exports = {
    createModel,
    template,
};
