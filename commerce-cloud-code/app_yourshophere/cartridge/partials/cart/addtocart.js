/**
 * Create view model for the add to cart dialog
 * @param {Object} options - The options object containing lineitem and basket information
 * @returns {Object} The view model containing product details
 */
exports.createModel = function createModel(options) {
    const StringUtils = require('dw/util/StringUtils');
    const URLUtils = require('dw/web/URLUtils');

    const lineitem = options.lineitem;

    const model = {
        quantity: lineitem.quantityValue,
        text: lineitem.lineItemText,
        price: StringUtils.formatMoney(lineitem.price),
        cartUrl: URLUtils.url('Cart-Show'),
        itemCount: options.basket.productQuantityTotal,
    };

    return model;
};

/**
 * Render the add to cart dialog
 * @param {Object} model - The view model containing product details
 * @returns {string} The HTML template for the add to cart dialog
 */
exports.template = (model) => `<dialog open>
<article>
    <a href="#close"
        aria-label="Close"
        class="close"
        data-target="modal-example"
        onClick="this.closest('dialog').outerHTML=''">
    </a>
  <h3>Your product has been added to cart</h3>
  <p>
    ${model.quantity}x - ${model.text} - ${model.price}
  </p>
  <footer>
    <a href="" role="button" class="secondary" onClick="this.closest('dialog').outerHTML=''">Continue Shopping</a>
    <a href="${model.cartUrl}" role="button"
        hx-get="${model.cartUrl}?hx=main"
        hx-target="main"
        hx-trigger="click"
        hx-push-url="${model.cartUrl}"
        hx-indicator=".progress">Go to cart</a>
  </footer>
</article>
</dialog>
<div hx-swap-oob="innerHTML:#minicart-items">
    ${model.itemCount}
</div>`;
