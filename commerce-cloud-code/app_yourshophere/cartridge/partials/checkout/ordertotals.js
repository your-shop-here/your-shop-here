/**
 * Creates a model object containing order total information from the current basket
 * @returns {Object} Model containing formatted monetary values and labels for order totals
 * @property {string} subtotal - Formatted merchandise subtotal
 * @property {string} shippingTotal - Formatted shipping total
 * @property {string} taxTotal - Formatted tax total
 * @property {string} total - Formatted order total
 * @property {Object} labels - Localized labels for the totals
 */
exports.createModel = function createModel() {
    const Money = require('dw/value/Money');
    const StringUtils = require('dw/util/StringUtils');
    const BasketMgr = require('dw/order/BasketMgr');
    const Resource = require('dw/web/Resource');

    const basket = BasketMgr.getCurrentBasket();
    const model = {
        subtotal: Money.NOT_AVAILABLE,
        shippingTotal: Money.NOT_AVAILABLE,
        taxTotal: Money.NOT_AVAILABLE,
        total: Money.NOT_AVAILABLE,
        labels: {
            subtotal: Resource.msg('label.subtotal', 'translations', null),
            shipping: Resource.msg('label.shipping', 'translations', null),
            tax: Resource.msg('label.tax', 'translations', null),
            total: Resource.msg('label.total', 'translations', null),
        },
    };

    if (basket) {
        model.subtotal = StringUtils.formatMoney(basket.getAdjustedMerchandizeTotalPrice());
        model.shippingTotal = StringUtils.formatMoney(basket.getShippingTotalPrice());
        model.taxTotal = StringUtils.formatMoney(basket.getTotalTax());
        model.total = StringUtils.formatMoney(basket.getTotalGrossPrice());
    }

    return model;
};

/**
 * Renders the Order Totals Component
 *
 * @param {Object} model - The model object containing order total information
 * @returns {string} The HTML template for the Order Totals Component
 */
exports.template = model => `
    <div class="order-totals">
        <div class="order-totals__row">
            <span class="order-totals__label">${model.labels.subtotal}:</span>
            <span class="order-totals__value">${model.subtotal}</span>
        </div>
        <div class="order-totals__row">
            <span class="order-totals__label">${model.labels.shipping}:</span>
            <span class="order-totals__value">${model.shippingTotal}</span>
        </div>
        <div class="order-totals__row">
            <span class="order-totals__label">${model.labels.tax}:</span>
            <span class="order-totals__value">${model.taxTotal}</span>
        </div>
        <div class="order-totals__row order-totals__row--total">
            <span class="order-totals__label">${model.labels.total}:</span>
            <span class="order-totals__value">${model.total}</span>
        </div>
    </div>
`;
