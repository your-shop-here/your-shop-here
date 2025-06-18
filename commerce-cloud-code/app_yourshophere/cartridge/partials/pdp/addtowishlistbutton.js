/**
 * Creates a model for the Product add to wishlist button
 *
 * @param {Object} product - The product object
 * @param {Object} [options] - Optional settings for button style and text
 * @returns {Object} The model object
 */
exports.createModel = function createModel(product, options) {
    const Resource = require('dw/web/Resource');
    const URLUtils = require('dw/web/URLUtils');
    const settings = options && options.settings ? options.settings : {};
    const buttonStyle = options && options.buttonStyle ? options.buttonStyle : (settings.buttonStyle || 'primary');
    const buttonText = options && options.buttonText ? options.buttonText : (settings.buttonText || '');

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
