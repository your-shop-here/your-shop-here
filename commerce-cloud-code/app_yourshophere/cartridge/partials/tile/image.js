function gcd(a, b) {
    return b === 0 ? a : gcd(b, a % b);
}

function getCssAspectRatio(sw, sh) {
    if (sw <= 0 || sh <= 0) {
        return null; // Or handle error appropriately
    }
    // cache this?
    const commonDivisor = gcd(sw, sh);
    const simplifiedWidth = sw / commonDivisor;
    const simplifiedHeight = sh / commonDivisor;

    return `${simplifiedWidth} / ${simplifiedHeight}`;
}

/**
 * Create view model for a product image
 *
 * @todo Add responsive images
 * @param {dw.catalog.SearchHit} hit - The search hit containing product information
 * @param {dw.catalog.ProductSearchModel} search - The search model
 * @param {Object} imageFilter - Filter configuration for images
 * @param {string} imageFilter.key - Key for filtering images
 * @param {string} imageFilter.value - Value to filter images by
 * @param {Object} config - Configuration object
 * @param {string} [config.imageViewType=large] - Type of product image view
 * @returns {Object} The view model containing image URLs and product details
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

    const disObject = config.imageDISConfig.split('&').reduce((acc, pair) => {
        const [key, value] = pair.split('=');
        // Convert value to number if possible, otherwise keep as string
        acc[key] = Number.isNaN(Number(value)) ? value : Number(value);
        return acc;
    }, {});

    let aspectRatio;
    if (disObject.sw && disObject.sh) {
        aspectRatio = getCssAspectRatio(disObject.sw, disObject.sh);
    }
    return {
        largeUrl: url,
        pdpUrl: URLUtils.url('Product-Show', 'pid', hit.object.productID).toString(),
        name: hit.name,
        disParams: config.imageDISConfig,
        aspectRatio,
    };
};

/**
 * Render a product tile image
 * @param {Object} model - The view model containing image URLs and product image details
 * @returns {string} The HTML template for the product tile image
 */
exports.template = (model) => `<a href="${model.pdpUrl}">
   <img loading="lazy" alt="${model.name}" src="${model.largeUrl}?${model.disParams}" style="aspect-ratio: ${model.aspectRatio}" />
</a>`;

