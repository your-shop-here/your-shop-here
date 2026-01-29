
/**
 * Formats the price for a product in the local format
 * @param {dw.catalog.Product} containedProduct the product to render the price for
 * @param {Object} options the options object
 * @returns {string} The rendered price
 */
function renderPrice(containedProduct, options) {
    const formatMoney = require('dw/util/StringUtils').formatMoney;

    let priceString = formatMoney(containedProduct.priceModel.minPrice);
    if (containedProduct.priceModel.priceRange) {
        priceString = `${priceString} - ${formatMoney(containedProduct.priceModel.maxPrice)}`;
    }
    return `${priceString}`;
}

/**
 * Get the image URL for a product
 * @param {dw.catalog.Product} product the product to get the image URL for
 * @returns {string} The image URL
 */
function getImageUrl(product, options) {
    const image = product.getImage(options.settings.viewType || 'large', 0);
    if (!image) {
        return '';
    }

    let url = image.url.toString();
    if (!url.startsWith('http')) {
        url = image.getImageURL({ scaleWidth: 999 }).toString().split('?')[0];
    }
    return `${url}?${options.settings.disConfig || ''}`;
}
/**
 * In case a product has multiple SKUs (i.e base-product or set), this function reuses the product tile quick view modal to select the desired SKU.
 * @param {dw.catalog.Product} containedProduct base product or set product
 * @returns {Object} The view model required by the tile partial
 */
function createSelectSkuModal(containedProduct) {
    const HttpSearchParams = require('*/api/URLSearchParams');
    const Resource = require('dw/web/Resource');
    const model = {};

    let httpParams = new HttpSearchParams({ pid: containedProduct.ID });
    if (containedProduct.primaryCategory) {
        httpParams = new HttpSearchParams({ pid: containedProduct.ID, cgid: containedProduct.primaryCategory.ID });
    }
    model.searchParameters = httpParams;
    const componentSettings = require('*/cartridge/utils/ComponentSettings').get(httpParams.get('component'));
    const tileSearch = require('*/api/ProductSearchModel').get(httpParams, { swatchAttribute: componentSettings.swatchDimension });
    const ProductSearchHit = require('dw/catalog/ProductSearchHit');
    if (!containedProduct.productSet) {
        tileSearch.object.excludeHitType(ProductSearchHit.HIT_TYPE_PRODUCT_SET);
    } else {
        tileSearch.object.addHitTypeRefinement(ProductSearchHit.HIT_TYPE_PRODUCT_SET);
    }
    tileSearch.search();
    model.hit = tileSearch.foundProducts[0];
    model.label = Resource.msg('select_product', 'translations', null);
    return model;
}

/**
 * renders the appropriate product specific add to cart button
 * @param {dw.catalog.Product} containedProduct the product to render the add to cart button for
 * @returns {string} The rendered HTML for the add to cart button
 */
function renderAddToCartButton(containedProduct) {
    const renderer = require('*/api/partials');

    if (containedProduct.master || containedProduct.productSet) {
        return renderer.create('tile/addtocartbutton').html({ model: createSelectSkuModal(containedProduct) });
    }
    return renderer.create('pdp/addtocartbutton').html(containedProduct);
}

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

exports.getImageUrl = getImageUrl;
exports.renderPrice = renderPrice;
exports.renderAddToCartButton = renderAddToCartButton;
