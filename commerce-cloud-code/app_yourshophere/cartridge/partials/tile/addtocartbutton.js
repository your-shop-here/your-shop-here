/**
 * Create view model for the add to cart button in product tile
 * @param {dw.catalog.SearchHit} hit - The search hit containing product information
 * @returns {Object} The view model containing product details
 */
exports.createModel = function createModel(hit) {
    const Resource = require('dw/web/Resource');
    const URLUtils = require('dw/web/URLUtils');

    const model = {
        id: hit.productId,
        disabled: false,
        title: Resource.msg('add_to_bag', 'translations', null),
        url: URLUtils.url('Product-Show', 'pid', hit.productId, 'hx', 'product-modal').toString(),
    };

    return model;
};

/**
 * Render the add to cart button
 * @param {Object} model - The view model containing product details
 * @returns {string} The HTML template for the add to cart button
 */
exports.template = (model) => `
    <button class="add-to-cart btn btn-primary"
        data-pid="${model.id}"
        ${model.disabled ? 'disabled' : ''}
        hx-get="${model.url}"
        hx-target="this"
        hx-swap="afterend"
        hx-trigger="click"
        hx-indicator=".progress">
        ${model.title}
    </button>`;
