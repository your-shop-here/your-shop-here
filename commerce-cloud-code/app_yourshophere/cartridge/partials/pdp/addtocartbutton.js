/**
 * Creates a model for the Product add to cart button
 *
 * @param {Object} product - The product object
 * @returns {Object} The model object
 */
exports.createModel = function createModel(product) {
    const Resource = require('dw/web/Resource');
    const URLUtils = require('dw/web/URLUtils');

    const model = {
        id: product.ID,
        disabled: !product.priceModel.price.available,
        title: Resource.msg('add_to_bag', 'translations', null),
        url: URLUtils.url('Cart-Add', 'pid', product.ID, 'hx', 'cart-modal'),
    };

    return model;
};

/**
 * Renders a Product add to cart button
 *
 * @param {Object} model - The model object
 * @returns {string} The rendered HTML
 */
exports.template = (model) => /* html */ `
    <button class="add-to-cart btn btn-primary"
        data-pid="${model.id}"
        ${model.disabled ? 'disabled' : ''}
        hx-get="${model.url}"
        hx-target="this"
        hx-swap="afterend"
        hx-include="form[name=pdp-actions]"
        hx-trigger="click"
        hx-indicator=".progress">
        ${model.title}
    </button>`;
