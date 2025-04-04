
exports.createModel = function createModel(input) {
    const BasketMgr = require('dw/order/BasketMgr');
    const PaymentMgr = require('dw/order/PaymentMgr');
    const Locale = require('dw/util/Locale');
    const URLUtils = require('dw/web/URLUtils');

    const basket = BasketMgr.getCurrentOrNewBasket();
    const applicablePaymentMethods = PaymentMgr.getApplicablePaymentMethods(customer, Locale.getLocale(request.locale).getCountry(), basket.totalGrossPrice.value);
    const model = {};

    // self-reference, so Checkout Save Addresses comes back here.
    // If you base your own pd components on this, dont copy and paste this without swapping the partial
    model.applicablePaymentMethods = applicablePaymentMethods.toArray();
    model.hxActionUrl = URLUtils.url('Checkout-SavePayment').append('hxpartial', 'checkout/paymentMethods');
    model.actionUrl = URLUtils.url('Checkout-SavePayment');
    model.selectedMethodId = !basket.paymentInstruments.empty ? basket.paymentInstruments[0].paymentMethod : '';
    return model;
};

function input(paymentMethod, model) {
    return `
    <label for="${paymentMethod.ID}">
    <input type="radio" name="paymentmethod" id="${paymentMethod.ID}" placeholder=""${paymentMethod.name}" value="${paymentMethod.ID}" ${(model.selectedMethodId === paymentMethod.ID) ? 'checked' : ''} />
    ${paymentMethod.name}
    </label>
    `;
}

exports.template = function (model) {
    return `<form hx-post="${model.hxActionUrl}" hx-trigger="change" hx-target="this" hx-swap="outerHTML" method="post" action="${model.actionUrl}">
        ${model.applicablePaymentMethods.map((paymentMethod) => input(paymentMethod, model)).join('')}

    </form>`;
};
