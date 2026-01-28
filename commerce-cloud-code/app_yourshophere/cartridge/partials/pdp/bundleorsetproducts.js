/**
 * Creates a model for the bundle or set products
 *
 * @param {Object} options - The options object
 * @param {Object} options.product - The product object
 * @param {Object} options.settings - The settings object
 * @returns {Object} The model object
 */
exports.createModel = function createModel(options) {
    const { renderPrice, getImageUrl, renderAddToCartButton } = require('*/cartridge/partials/shared-templates/product-items');

    const product = options.product;
    const model = {
        title: options.settings.title,
        items: [],
    };

    // Check if product is a bundle or set
    if (product.bundle || product.productSet) {
        const productItems = product.bundle ? product.bundledProducts : product.productSetProducts;
        const productItemArray = productItems.toArray();

        model.items = productItemArray.map((containedProduct) => ({
            pid: containedProduct.ID,
            name: containedProduct.name,
            price: renderPrice(containedProduct, options),
            quantity: product.bundle ? product.getBundledProductQuantity(containedProduct).value : 1,
            image: getImageUrl(containedProduct, options),
            addToCartButton: options.settings.showAddToCart ? renderAddToCartButton(containedProduct) : '',

        }));
    }

    return model;
};

exports.template = (model) => require('*/cartridge/partials/shared-templates/product-items').template(model);
