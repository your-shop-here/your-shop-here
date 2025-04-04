/**
 * Create view model for a product image
 *
 * @todo Add responsive images
 * @param {dw.catalog.Product} product
 * @returns the view model
 */
exports.createModel = function createImageModel(hit, search, imageFilter, config) {
    const URLUtils = require('dw/web/URLUtils');

    let url;
    if (imageFilter) {
        url = (function getFilteredImages() {
            const foundColor = search.getRepresentedVariationValues(imageFilter.key).filter((color) => color.value === imageFilter.value).pop();
            if (foundColor) {
                return foundColor.getImage(config.imageViewType || 'large', 0).url;
            }
            return undefined;
        }());
    }

    if (!url) {
        url = hit.product.getImages(config.imageViewType || 'large')[0].url;
    }

    return {
        largeUrl: url,
        pdpUrl: URLUtils.url('Product-Show', 'pid', hit.productID).toString(),
        name: hit.name,
        width: '300',
    };
};

exports.template = (model) => `<a href="${model.pdpUrl}">
    <img loading="lazy"
        alt="${model.name}"
        src="${model.largeUrl}?sw=${model.width}" />
</a>`;
