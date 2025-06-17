/**
 * Creates the model for the mini wishlist include
 * @returns {Object} The model for the mini wishlist include
 */
function createModel() {
    const StringUtils = require('dw/util/StringUtils');
    const model = {
        wishlistInfo: {
            itemCount: StringUtils.formatNumber(session.privacy.wishlistCount || 0, '0.#'),
        },
    };
    return model;
}

/**
 * Renders the mini wishlist include
 * @param {Object} model - The model for the mini wishlist include
 * @returns {string} The HTML for the mini wishlist include
 */
function template(model) {
    return `<a href="${require('dw/web/URLUtils').url('Wishlist-Show')}" class="header-link">
        <span id="header-wishlist-count">${model.wishlistInfo.itemCount}</span>
    </a>`;
}

module.exports = {
    createModel,
    template,
};
