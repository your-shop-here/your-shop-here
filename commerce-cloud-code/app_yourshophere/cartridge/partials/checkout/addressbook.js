const URLUtils = require('dw/web/URLUtils');
const Resource = require('dw/web/Resource');

exports.createModel = function createModel(input) {
    const BasketMgr = require('dw/order/BasketMgr');
    const basket = BasketMgr.getCurrentOrNewBasket();
    const model = {};
    model.addressBookTitle = input.title || '';
    const Form = require('api/Form');

    // the address form defines the local layout of an address. I.e. in which order the fields are displayed and how they are grouped.
    const form = new Form('address');

    model.rows = form.rows();

    model.addressBook = customer.isAuthenticated() ? customer.getProfile().getAddressBook().getAddresses().toArray()
        .map((customerAddress) => {
            const customerForm = new Form('address');
            const rows = customerForm.rowValues(customerAddress);
            const isSelected = basket.billingAddress && basket.billingAddress.isEquivalentAddress(customerAddress);
            const addressId = customerAddress.ID;
            return {
                address: customerAddress,
                rows,
                isSelected,
                useUrl: URLUtils.url('Checkout-SaveAddresses', 'addressId', addressId),
                useHxPost: URLUtils.url('Checkout-SaveAddresses', 'hxpartial', 'checkout/addressbook', 'addressId', addressId),
                useLabel: Resource.msg('use_address', 'translations', null),
                deleteUrl: URLUtils.url('Account-DeleteAddress', 'addressId', addressId),
                deleteHxPost: URLUtils.url('Account-DeleteAddress', 'hxpartial', 'checkout/addressbook', 'addressId', addressId),
                deleteLabel: Resource.msg('delete', 'translations', null),
                selectedLabel: Resource.msg('selected', 'translations', null),
                checkIcon: URLUtils.staticURL('/icons/check.svg'),
                trashIcon: URLUtils.staticURL('/icons/trash.svg'),
                checkCircleIcon: URLUtils.staticURL('/icons/check-circle.svg'),
            };
        }) : null;
    model.addressBook = (model.addressBook && model.addressBook.length === 0) ? null : model.addressBook;
    return model;
};

// @todo externalize to share with checkout/addresses.js
function display(field) {
    return `<span>${field.value || ''} <span>`;
}

// @todo externalize to share with checkout/addresses.js
function displayRow(row) {
    return `<div class="grid" id="row-${row[0].rowId || row[0].fieldId}">
  ${(row).map((field) => display(field)).join('')}
  </div>`;
}

function renderAddressBook(model) {
    return `
    <div class="checkout-addressbook-container">
    <h2>${model.addressBookTitle}</h2>
    <div class="address-book-grid">
        ${model.addressBook.map((addressBookEntry) => {
        const fields = addressBookEntry.rows.map((row) => displayRow(row)).join('');
        const selectedLabel = addressBookEntry.isSelected ? `
                <div class="selected-label">
                    <img src="${addressBookEntry.checkCircleIcon}" alt="Selected" class="icon" />
                    ${addressBookEntry.selectedLabel}
                </div>
            ` : '';
        const buttons = !addressBookEntry.isSelected ? `
                <div class="address-actions">
                    <a href="${addressBookEntry.useUrl}" 
                       class="address-action-button use-button"
                       hx-post="${addressBookEntry.useHxPost}"
                       hx-target="closest .checkout-addressbook-container"
                       hx-swap="outerHTML">
                        <img src="${addressBookEntry.checkIcon}" alt="Use" class="icon" />
                        ${addressBookEntry.useLabel}
                    </a>
                    <a href="${addressBookEntry.deleteUrl}" 
                       class="address-action-button delete-button"
                       hx-post="${addressBookEntry.deleteHxPost}"
                       hx-target="closest .checkout-addressbook-container"
                       hx-swap="outerHTML">
                        <img src="${addressBookEntry.trashIcon}" alt="Delete" class="icon" />
                        ${addressBookEntry.deleteLabel}
                    </a>
                </div>
            ` : '';
        return `<div class="addressBookEntry checkout-address-card ${addressBookEntry.isSelected ? 'selected' : ''}">${selectedLabel}${fields}${buttons}</div>`;
    }).join('')}
    </div>
  </div>`;
}

exports.template = (model) => (renderAddressBook(model));
