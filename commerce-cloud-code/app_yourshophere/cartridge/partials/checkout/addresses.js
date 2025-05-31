const URLUtils = require('dw/web/URLUtils');

exports.createModel = function createModel(input) {
    const BasketMgr = require('dw/order/BasketMgr');
    const basket = BasketMgr.getCurrentOrNewBasket();
    const model = {};
    model.showForm = true;

    const Form = require('api/Form');
    const form = new Form('address');
    const Resource = require('dw/web/Resource');

    model.rows = form.rows();
    model.invalidFields = input.addressValidation && input.addressValidation.invalidFields;
    let address = !input.newAddress && basket.billingAddress;

    if (input.newAddress) {
        form.clearTemp();
        if (basket.billingAddress) {
            const Transaction = require('dw/system/Transaction');
            Transaction.wrap(() => {
                form.persist(basket.billingAddress, request.httpParameterMap);
            });
        }
    }

    let temp = false;
    // address.lastName is empty when an existing address was cleared via the new address button
    if (!address || !address.lastName) {
        address = form.getTemp();
        temp = true;
    }
    if (address) {
        if ((input && input.forceEdit && input.forceEdit.includes('address')) || temp) {
            model.showCancel = true;
        } else {
            model.showForm = false;
        }
        model.address = address;
        model.rows = form.rowValues(address);

        model.editUrl = URLUtils.url('Checkout-Show', 'forceEdit', 'address');
        model.hxEditUrl = URLUtils.url('Checkout-Show', 'hxpartial', 'checkout/addresses', 'forceEdit', 'address');
        model.editLabel = Resource.msg('edit', 'translations', null);

        model.newUrl = URLUtils.url('Checkout-Show', 'forceEdit', 'address', 'new', 'true');
        model.hxNewUrl = URLUtils.url('Checkout-Show', 'hxpartial', 'checkout/addresses', 'forceEdit', 'address', 'new', 'true');
        model.newLabel = Resource.msg('new_address', 'translations', null);
    }
    // self-reference, so Checkout Save Addresses comes back here.
    // If you base your own pd components on this, dont copy and paste this without swapping the partial
    model.hxActionUrl = URLUtils.url('Checkout-SaveAddresses', 'hxpartial', 'checkout/addresses', 'forceEdit', 'address');

    model.actionUrl = URLUtils.url('Checkout-SaveAddresses');
    model.errorMessage = Resource.msg('forms.labels.error.invalid', 'translations', null);
    model.outOfBandSwap = input.outOfBandSwap;

    return model;
};

function inputControl(field, model) {
    const isInvalid = model.invalidFields && model.invalidFields.includes(field.fieldId);

    return `
    <label for="${field.fieldId}" ${isInvalid ? 'class="form-field-invalid"' : ''}>
      ${field.label}${isInvalid ? `<span role="alert">${model.errorMessage}</span>` : ''}
      <input type="${field.type}" 
        name="${field.fieldId}" 
        id="${field.fieldId}" 
        placeholder="${field.label}" 
        value="${field.value || ''}" 
        aria-invalid="${isInvalid}"
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
    return `<div class="checkout-address-card" id="readOnlyAddress">${fields}
            <div class="address-actions">
                <a href="${model.editUrl}" hx-get="${model.hxEditUrl}" hx-target="#readOnlyAddress" hx-swap="outerHTML" class="address-action-button edit-button">
                    <img src="${URLUtils.staticURL('/icons/edit.svg')}" alt="Edit" class="icon" />
                    ${model.editLabel}
                </a>
                <a href="${model.newUrl}" hx-get="${model.hxNewUrl}" hx-target="#readOnlyAddress" hx-swap="outerHTML" class="address-action-button new-button">
                    <img src="${URLUtils.staticURL('/icons/plus.svg')}" alt="Add" class="icon" />
                    ${model.newLabel}
                </a>
            </div>
        </div>`;
}

exports.template = (model) => `<div class="checkout-address-selector" ${model.outOfBandSwap ? 'hx-swap-oob="outerHTML:.checkout-address-selector"' : ''}>${(model.showForm ? renderForm(model) : miniaddress(model))}</div>`;
