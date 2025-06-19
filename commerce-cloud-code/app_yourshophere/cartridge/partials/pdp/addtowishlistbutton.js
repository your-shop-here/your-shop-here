/**
 * Creates a model for the Product add to wishlist button
 *
 * @param {Object} options - The options object containing product and optional settings
 * @param {Object} options.product - The product object
 * @param {string} [options.buttonStyle] - Optional button style (default: 'primary')
 * @param {string} [options.buttonText] - Optional button text
 * @returns {Object} The model object
 */
exports.createModel = function createModel(options) {
    const Resource = require('dw/web/Resource');
    const URLUtils = require('dw/web/URLUtils');
    let { product, buttonStyle, buttonText } = options;
    buttonStyle = buttonStyle || 'primary';

    const model = {
        id: product.ID,
        disabled: false, // Assume always enabled for wishlist
        title: buttonText || Resource.msg('add_to_wishlist', 'translations', null) || 'Add to Wishlist',
        url: URLUtils.url('Wishlist-Add', 'pid', product.ID),
        hxurl: URLUtils.url('Wishlist-Add', 'pid', product.ID, 'hx', 'wishlist-modal'),
        buttonStyle,
    };

    return model;
};

/**
 * Renders a Product add to wishlist button
 *
 * @param {Object} model - The model object
 * @returns {string} The rendered HTML
 */
exports.template = (model) => /* html */ `
    <form name="pdp-actions" action="${model.url}">
        <input type="hidden" name="pid" value="${model.id}" />
        <button class="add-to-wishlist btn btn-${model.buttonStyle}"
            data-pid="${model.id}"
            ${model.disabled ? 'disabled' : ''}
            hx-get="${model.hxurl}"
            hx-target="this"
            hx-swap="afterend"
            hx-include="form[name=pdp-actions]"
            hx-trigger="click"
            hx-indicator=".progress">
            <i class="fa fa-heart"></i> ${model.title}
        </button>
    </form>`;
