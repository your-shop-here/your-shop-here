/**
 * Creates a model for the bundle or set products
 *
 * @param {Object} options - The options object
 * @param {Object} options.product - The product object
 * @param {Object} options.settings - The settings object
 * @returns {Object} The model object
 */
exports.createModel = function createModel(options) {
    const renderer = require('*/api/partials');
    const formatMoney = require('dw/util/StringUtils').formatMoney;
    const product = options.product;
    const model = {
        title: options.settings.title,
        items: [],
    };

    // Check if product is a bundle or set
    if (product.bundle || product.productSet) {
        const productItems = product.bundle ? product.bundledProducts : product.productSetProducts;

        model.items = productItems.toArray().map((containedProduct) => ({
            pid: containedProduct.ID,
            name: containedProduct.name,
            price: formatMoney(containedProduct.priceModel.price),
            quantity: product.bundle ? product.getBundledProductQuantity(containedProduct).value : 1,
            image: containedProduct.getImages('medium')[0].url,
            addToCartButton: options.settings.showAddToCart ? renderer.create('pdp/addtocartbutton').html(containedProduct) : '',

        }));
    }

    return model;
};

/**
 * Renders the bundle or set products
 *
 * @param {Object} model - The model object
 * @returns {string} The rendered HTML
 */
exports.template = (model) => {
    if (!model.items || model.items.length === 0) {
        return '';
    }

    return `
        ${model.title ? `<h2 class="bundle-title">${model.title}</h2>` : ''}
        <div class="bundle-products">
            ${model.items.map((item) => `
                <div class="bundle-product">
                    <div class="bundle-product-image">
                        <img src="${item.image}" alt="${item.name}">
                    </div>
                    <div class="bundle-product-details">
                        <h3 class="bundle-product-name">${item.name}</h3>
                        ${item.quantity ? `<div class="bundle-product-quantity">Quantity: ${item.quantity}</div>` : ''}
                        <div class="bundle-product-price">${item.price}</div>
                    </div>
                    ${item.addToCartButton}
                </div>
            `).join('')}
        </div>
    `;
};
