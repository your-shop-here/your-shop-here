/**
 * Calculates the greatest common divisor (GCD) of two non-negative integers using the Euclidean algorithm.
 *
 * @param {number} a - The first non-negative integer.
 * @param {number} b - The second non-negative integer.
 * @returns {number} The greatest common divisor of `a` and `b`.
 */
function greatestCommonDivisor(a, b) {
    return b === 0 ? a : greatestCommonDivisor(b, a % b);
}

/**
 * Calculates the simplified aspect ratio for CSS `aspect-ratio` property from given width and height.
 * The aspect ratio is returned in the format "width / height".
 *
 * @param {number} sw - The original width. Must be a positive number.
 * @param {number} sh - The original height. Must be a positive number.
 * @returns {string|null} A string representing the simplified aspect ratio (e.g., "16 / 9")
 * or `null` if `sw` or `sh` are zero or negative.
 */
function getCssAspectRatio(sw, sh) {
    if (sw <= 0 || sh <= 0) {
        return null;
    }

    // @todo Consider caching the result of greatestCommonDivisor if this function is called
    // very frequently with the same sw/sh pairs and performance is critical.
    // For most web applications, the overhead of calculating GCD on demand is negligible.
    const commonDivisor = greatestCommonDivisor(sw, sh);
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

