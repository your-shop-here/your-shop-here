/**
 * Creates the model for the minicart include
 * @returns {Object} The model for the minicart include
 */
function createModel() {
    const StringUtils = require('dw/util/StringUtils');
    // cart info is read from session.privacy to avoid fetching the basket, the values are set in calculate.js
    const model = {
        cartInfo: {
            itemCount: StringUtils.formatNumber(session.privacy.cartItemCount || 0, '0.#'),
            itemValue: session.privacy.cartItemValue || 0,
        },
    };
    return model;
}

/**
 * Renders the minicart include
 * @param {Object} model - The model for the minicart include
 * @returns {string} The HTML for the minicart include
 */
function template(model) {
    return `<span id="minicart-items">${model.cartInfo.itemCount}</span>`;
}

module.exports = {
    createModel,
    template,
};
