
/**
 * Creates a model object containing checkout button information
 * @param {Object} product - The product object (unused in this function)
 * @returns {Object} Model containing checkout button information
 * @property {boolean} disabled - Whether the checkout button is disabled
 * @property {string} title - The title of the checkout button
 * @property {string} url - The URL of the checkout page
 */
exports.createModel = function createModel(product) {
    const Resource = require('dw/web/Resource');
    const URLUtils = require('dw/web/URLUtils');
    const BasketMgr = require('dw/order/BasketMgr');
    const currentBasket = BasketMgr.getCurrentBasket();

    const model = {
        disabled: currentBasket == null || currentBasket.getTotalGrossPrice().value === 0,
        title: Resource.msg('checkout', 'translations', null),
        url: URLUtils.url('Checkout-Show').toString(),
    }; // eslint-disable-line no-undef

    return model;
};

/**
 * Renders a checkout button
 *
 * @param {Object} model - The model object containing checkout button information
 * @returns {string} The HTML template for the checkout button
 */
exports.template = model => `
<button class="checkout btn btn-primary"
    ${model.disabled ? 'disabled' : ''}
    hx-get="${model.url}"
    hx-push-url="${model.url}"
    hx-trigger="click"
    hx-target="body"
    hx-indicator=".progress">
    ${model.title}
</button>`;
