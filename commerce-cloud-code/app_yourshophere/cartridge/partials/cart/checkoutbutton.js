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
 * Renders a Product add to cart modal
 *
 */
exports.template = model => `
<button class="checkout btn btn-primary"
    ${model.disabled ? 'disabled' : ''}
    hx-get="${model.url}"
    hx-trigger="click"
    hx-target="body"
    hx-indicator=".progress">
    ${model.title}
</button>`;
