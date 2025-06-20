/**
 * Creates the model for the mini wishlist include
 * @returns {Object} The model for the mini wishlist include
 */
function createModel() {
    const StringUtils = require('dw/util/StringUtils');
    const ProductListMgr = require('dw/customer/ProductListMgr');
    const ProductList = require('dw/customer/ProductList');

    let count = session.privacy.wishlistCount;
    if (count === null) {
        const wishlist = ProductListMgr.getProductLists(customer, ProductList.TYPE_WISH_LIST).toArray().pop();
        if (wishlist) {
            session.privacy.wishlistCount = wishlist.productItems.length;
            count = session.privacy.wishlistCount;
        } else {
            session.privacy.wishlistCount = 0;
            count = 0;
        }
    }
    const model = {
        wishlistInfo: {
            itemCount: StringUtils.formatNumber(count, '0.#'),
        },
    };
    return model;
}

/**
 * Renders the mini wishlist include
 * @param {Object} model - The model for the mini wishlist include
 * @returns {string} The HTML for the mini wishlist include
 */
function template(model) {
    return `<a href="${require('dw/web/URLUtils').url('Wishlist-Show')}" class="header-link">
        <span id="header-wishlist-count">${model.wishlistInfo.itemCount}</span>
    </a>`;
}

module.exports = {
    createModel,
    template,
};
