
exports.createModel = function createModel(input) {
    const BasketMgr = require('dw/order/BasketMgr');
    const basket = BasketMgr.getCurrentOrNewBasket();
    const ShippingMgr = require('dw/order/ShippingMgr');

    const URLUtils = require('dw/web/URLUtils');
    const model = {};
    const applicableShippingMethods = ShippingMgr.getShipmentShippingModel(basket.defaultShipment).getApplicableShippingMethods();
    // self-reference, so Checkout Save Addresses comes back here.
    // If you base your own pd components on this, dont copy and paste this without swapping the partial
    model.applicableShippingMethods = applicableShippingMethods.toArray();
    model.hxActionUrl = URLUtils.url('Checkout-SaveShipping').append('hxpartial', 'checkout/shippingMethods');
    model.actionUrl = URLUtils.url('Checkout-SaveShipping');
    model.selectedMethodId = basket.defaultShipment.shippingMethod ? basket.defaultShipment.shippingMethod.ID : '';
    return model;
};

function input(shippingMethod, model) {
    return `
    <label for="${shippingMethod.ID}">
    <input type="radio" name="shippingmethod" id="${shippingMethod.ID}" placeholder=""${shippingMethod.displayName}" value="${shippingMethod.ID}" ${(model.selectedMethodId === shippingMethod.ID) ? 'checked' : ''} />
    ${shippingMethod.displayName}
    </label>
    `;
}

exports.template = function (model) {
    return `<form hx-post="${model.hxActionUrl}" hx-trigger="change" hx-target="this" hx-swap="outerHTML" method="post" action="${model.actionUrl}">
        ${model.applicableShippingMethods.map((shippingMethod) => input(shippingMethod, model)).join('')}
    </form>`;
};
