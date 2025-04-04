
exports.createModel = function createModel(input) {
    const BasketMgr = require('dw/order/BasketMgr');
    const basket = BasketMgr.getCurrentOrNewBasket();
    const URLUtils = require('dw/web/URLUtils');
    const model = {};
    model.showForm = true;

    const Form = require('api/Form');
    const form = new Form('address');
    const Resource = require('dw/web/Resource');

    model.rows = form.rows();
    const address = basket.billingAddress || form.getTemp();
    if (address) {
        if (input && input.forceEdit && input.forceEdit.includes('address')) {
            model.showForm = true;
            model.showCancel = true;
        } else {
            model.showForm = false;
        }
        model.address = address;
        model.rows = form.rowValues(address);
        model.editUrl = URLUtils.url('Checkout-Show', 'forceEdit', 'address');
        model.hxEditUrl = URLUtils.url('Checkout-Show', 'hxpartial', 'checkout/addresses', 'forceEdit', 'address');
        model.editLabel = Resource.msg('edit', 'translations', null);
    }
    // self-reference, so Checkout Save Addresses comes back here.
    // If you base your own pd components on this, dont copy and paste this without swapping the partial
    model.hxActionUrl = URLUtils.url('Checkout-SaveAddresses', 'hxpartial', 'checkout/addresses', 'forceEdit', 'address');

    model.actionUrl = URLUtils.url('Checkout-SaveAddresses');

    return model;
};

function inputControl(field, model) {
    return `
    <label for="${field.fieldId}">
      ${field.label}
      <input type="${field.type}" 
        name="${field.fieldId}" 
        id="${field.fieldId}" 
        placeholder="${field.label}" 
        value="${field.value || ''}" 
        hx-post="${model.hxActionUrl}" 
        hx-trigger="change"/>
    </label>
    `;
}

function display(field) {
    return `<span>${field.value || ''} <span>`;
}

function inputRow(row, model) {
    return `<div class="grid" id="row-${row[0].rowId || row[0].fieldId}">
    ${(row).map((field) => inputControl(field, model)).join('')}
    </div>`;
}

function displayRow(row) {
    return `<div class="grid" id="row-${row[0].rowId || row[0].fieldId}">
  ${(row).map((field) => display(field)).join('')}
  </div>`;
}

function renderForm(model) {
    const fields = model.rows.map((row) => inputRow(row, model)).join('');
    // @todo allow different shipping address
    return `<form hx-post="${model.hxActionUrl}" hx-target="this" hx-swap="outerHTML" method="post" action="${model.actionUrl}">
      ${fields}
      <div class="grid">
        <button>Submit</button>
        ${model.showCancel ? '<button>Cancel</button>' : ''}
        </div>
      </form>`;
}

function miniaddress(model) {
    const fields = model.rows.map((row) => displayRow(row)).join('');
    return `<div id="readOnlyAddress">${fields}<a href="${model.editUrl}" hx-get="${model.hxEditUrl}" hx-target="#readOnlyAddress" hx-swap="outerHTML">${model.editLabel}</a></div>`;
}

exports.template = (model) => (model.showForm ? renderForm(model) : miniaddress(model));
