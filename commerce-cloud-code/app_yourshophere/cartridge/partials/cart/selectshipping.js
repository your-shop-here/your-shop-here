/**
 * Creates the model for the Shipping Selection component.
 * @returns {Object} The model object.
 */
exports.createModel = () => {
    const BasketMgr = require('dw/order/BasketMgr');
    const Resource = require('dw/web/Resource');
    const URLUtils = require('dw/web/URLUtils');
    const ShippingMgr = require('dw/order/ShippingMgr');
    const StringUtils = require('dw/util/StringUtils');
    const basket = BasketMgr.getCurrentBasket();

    let shippingMethods = [];
    let selectedShippingMethodID = '';

    if (basket && basket.shipments && basket.shipments[0]) {
        shippingMethods =ShippingMgr.getAllShippingMethods().toArray().map((method) => ({
            ID: method.ID,
            displayName: method.displayName,
            shippingCost: StringUtils.formatMoney(ShippingMgr.getShippingCost(method, basket.getMerchandizeTotalPrice())),
        }));
        if (basket.shipments[0].shippingMethod) {
            selectedShippingMethodID = basket.shipments[0].shippingMethod.ID;
        }
    }

    return {
        shippingMethods,
        selectedShippingMethodID,
        shippingCost: StringUtils.formatMoney(basket.shippingTotalPrice),
        shippingLabel: Resource.msg('shipping', 'translations', null),
        shippingCostLabel: Resource.msg('shipping_cost', 'translations', null),
        shippingChangeUrl: URLUtils.url('Cart-UpdateShipping').toString(),
    };
};

/**
 * Renders the Shipping Selection component using a string template.
 * @param {Object} model - The model object containing the data for rendering.
 * @returns {string} The rendered HTML.
 */
exports.template = (model) => `
    <div class="shipping-selection-container">
        <label for="shipping-method">${model.shippingLabel}</label>
        <select id="shipping-method" name="shippingMethod" 
            hx-post="${model.shippingChangeUrl}?hx=main" 
            hx-target="main"
            hx-trigger="change"
            hx-indicator=".progress"
        >
            ${model.shippingMethods.map((method) => `
                <option value="${method.ID}" ${method.ID === model.selectedShippingMethodID ? 'selected' : ''}>
                    ${method.displayName} - ${method.shippingCost}
                </option>
            `).join('')}
        </select>
        <p class="shipping-cost">${model.shippingCostLabel}: ${model.shippingCost ? model.shippingCost : ''}</p>
    </div>
`;
