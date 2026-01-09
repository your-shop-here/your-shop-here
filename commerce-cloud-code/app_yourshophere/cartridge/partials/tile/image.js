const getCssAspectRatio = require('*/cartridge/utils/image').getCssAspectRatio;
/**
 * Create view model for a product tile image
 *
 * @todo Add responsive images
 * @param {Object} options - The options object
 * @param {dw.catalog.SearchHit} options.hit - The search hit containing product information
 * @param {dw.catalog.ProductSearchModel} options.search - The search model
 * @param {Object} options.imageFilter - Filter configuration for images
 * @param {string} options.imageFilter.key - Key for filtering images
 * @param {string} options.imageFilter.value - Value to filter images by
 * @param {Object} options.config - Configuration object
 * @param {string} [options.config.imageViewType=large] - Type of product image view
 * @returns {Object} The view model containing image URLs and product details
 */
exports.createModel = function createImageModel() {
    const URLUtils = require('dw/web/URLUtils');
    const model = request.custom.model;

    const {
        hit,
        search,
        imageFilter,
        config,
    } = model;

    let url;
    if (imageFilter) {
        url = (function getFilteredImages() {
            const foundColor = search.getRepresentedVariationValues(imageFilter.key).filter((color) => color.value === imageFilter.value).pop();
            if (foundColor && foundColor.getImage(config.imageViewType || 'large', 0)) {
                return foundColor.getImage(config.imageViewType || 'large', 0).url;
            }
            return undefined;
        }());
    }
    if (!url && hit.object.product.getImage(config.imageViewType || 'large', 0)) {
        url = hit.object.product.getImage(config.imageViewType || 'large', 0).url;
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

