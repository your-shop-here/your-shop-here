/**
 * Create view model for the add to wishlist dialog
 * @param {Object} options - The options object containing product and wishlist information
 * @returns {Object} The view model containing product details
 */
exports.createModel = function createModel(options) {
    const URLUtils = require('dw/web/URLUtils');
    const Resource = require('dw/web/Resource');

    const product = options.product;

    const model = {
        productName: product.getName(),
        productImage: product.getImage('small', 0) ? product.getImage('small', 0).getURL().toString() : '',
        wishlistUrl: URLUtils.url('Wishlist-Show'),
        resources: {
            close: Resource.msg('addtowishlist.close', 'translations', null) || 'Close',
            title: Resource.msg('addtowishlist.title', 'translations', null) || 'Added to Wishlist',
            continueShopping: Resource.msg('addtowishlist.continue.shopping', 'translations', null) || 'Continue Shopping',
            goToWishlist: Resource.msg('addtowishlist.go.to.wishlist', 'translations', null) || 'Go to Wishlist',
        },
    };

    return model;
};

/**
 * Render the add to wishlist dialog
 * @param {Object} model - The view model containing product details
 * @returns {string} The HTML template for the add to wishlist dialog
 */
exports.template = (model) => `<dialog open>
<article>
    <a href="#close"
        aria-label="${model.resources.close}"
        class="close"
        data-target="modal-example"
        onClick="this.closest('dialog').outerHTML=''">
    </a>
  <h3>${model.resources.title}</h3>
  <div class="wishlist-add-modal-product">
    ${model.productImage ? `<img src="${model.productImage}" alt="${model.productName}" class="wishlist-add-modal-image"/>` : ''}
    <span class="wishlist-add-modal-name">${model.productName}</span>
  </div>
  <footer>
    <a href="" role="button" class="secondary" onClick="this.closest('dialog').outerHTML=''">${model.resources.continueShopping}</a>
    <a href="${model.wishlistUrl}" role="button"
        hx-get="${model.wishlistUrl}?hx=main"
        hx-target="main"
        hx-trigger="click"
        hx-push-url="${model.wishlistUrl}"
        hx-indicator=".progress">${model.resources.goToWishlist}</a>
  </footer>
</article>
</dialog>
`;
