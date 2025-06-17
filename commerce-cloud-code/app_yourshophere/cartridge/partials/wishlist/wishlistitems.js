/**
 * Creates a model for the wishlist items component
 * @param {Object} options - The options object containing settings
 * @returns {Object} The model object
 */
exports.createModel = function createModel(options) {
    const Resource = require('dw/web/Resource');
    const ProductListMgr = require('dw/customer/ProductListMgr');
    const ProductList = require('dw/customer/ProductList');
    const URLUtils = require('dw/web/URLUtils');
    const StringUtils = require('dw/util/StringUtils');
    const settings = options && options.settings ? options.settings : {};
    const buttonStyle = options && options.buttonStyle ? options.buttonStyle : (settings.buttonStyle || 'primary');
    let enableRemove;
    if (options && typeof options.enableRemove !== 'undefined') {
        enableRemove = options.enableRemove === 'enabled';
    } else if (settings && typeof settings.enableRemove !== 'undefined') {
        enableRemove = settings.enableRemove === 'enabled';
    } else {
        enableRemove = true;
    }
    const addToCartText = (options && options.addToCartText) ? options.addToCartText : (settings.addToCartText || '');
    const model = {
        empty: true,
        items: [],
        emptyMessage: Resource.msg('wishlist.empty', 'translations', null),
        URLUtils,
        labels: {
            product: Resource.msg('cart.product', 'translations', null),
            price: Resource.msg('cart.price', 'translations', null),
            actions: Resource.msg('cart.actions', 'translations', null),
        },
        buttonStyle,
        enableRemove,
        addToCartText,
    };

    // we show the last created wishlist, if there are multiple wishlists, we show the last one
    const wishlist = ProductListMgr.getProductLists(customer, ProductList.TYPE_WISH_LIST).toArray().pop();
    if (wishlist) {
        const listItems = wishlist.getProductItems();
        model.items = listItems.toArray().map((productItem) => {
            const product = productItem.getProduct();
            return {
                productID: productItem.getProductID(),
                productName: product ? product.getName() : '',
                price: product && product.getPriceModel().price.available ? StringUtils.formatMoney(product.getPriceModel().price) : '',
                image: product && product.getImage('small', 0) ? product.getImage('small', 0).getURL().toString() : '',
                pdpUrl: product ? URLUtils.url('Product-Show', 'pid', productItem.getProductID()).toString() : '#',
                addToCartUrl: product ? URLUtils.url('Cart-Add', 'pid', productItem.getProductID(), 'hx', 'cart-modal').toString() : '#',
                canAddToCart: product && product.getPriceModel().price.available,
            };
        });
        if (model.items.length > 0) {
            model.empty = false;
        }
    }

    return model;
};

/**
 * Renders the wishlist items component
 * @param {Object} model - The model object
 * @returns {string} The rendered HTML
 */
exports.template = (model) => (model.empty ? /* html */ `
    <div class="wishlist-empty-message" role="alert">
        <p>${model.emptyMessage}</p>
    </div>
` : /* html */ `
    <div class="wishlist-container">
        <table class="wishlist-items-table" role="grid">
            <thead>
                <tr>
                    <th scope="col"></th>
                    <th scope="col">${model.labels.product}</th>
                    <th scope="col">${model.labels.price}</th>
                    <th scope="col">${model.labels.actions}</th>
                </tr>
            </thead>
            <tbody>
                ${model.items.map((item) => /* html */ `
                    <tr class="wishlist-item">
                        <td>
                            ${item.image ? `<a href="${item.pdpUrl}"><img src="${item.image}" alt="${item.productName}" class="wishlist-item-image"/></a>` : ''}
                        </td>
                        <td>
                            <a href="${item.pdpUrl}">${item.productName}</a>
                        </td>
                        <td>${item.price}</td>
                        <td>
                            ${model.enableRemove ? `<button type="button"
                                class="wishlist-remove-link btn btn-${model.buttonStyle}"
                                data-pid="${item.productID}"
                                onclick="window.location='${model.URLUtils.url('Wishlist-Remove', 'pid', item.productID)}'">
                                <i class="fa fa-trash"></i> Remove
                            </button>` : ''}
                            <button class="add-to-cart btn btn-${model.buttonStyle}" data-pid="${item.productID}" ${!item.canAddToCart ? 'disabled' : ''}
                                hx-get="${item.addToCartUrl}"
                                hx-target="this"
                                hx-swap="afterend"
                                hx-trigger="click"
                                hx-indicator=".progress">
                                ${model.addToCartText ? model.addToCartText : 'Add to Cart'}
                            </button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    </div>
`);
