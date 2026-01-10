/**
 * Creates a model for product swatches
 * @param {Object} options - The options object
 * @param {Object} options.hit - The search hit containing product information
 * @param {Object} options.search - The search model
 * @param {Object} options.config - Configuration object
 * @param {string} options.config.swatchAttribute - The swatch attribute to use
 * @returns {Object} The model object
 */
exports.createModel = function createModel(options) {
    const URLUtils = require('dw/web/URLUtils');
    const model = options.model;
    const { hit, search, config } = model;
    const colorValues = search.getRepresentedVariationValues(config.imageDimension);
    // nothing to select
    if (colorValues.length < 2) {
        return { swatches: [] };
    }
    const swatches = colorValues.map((color) => {
        // @todo make swatch viewtype configurable including fallbacks
        const image = color.getImage(config.swatchViewType, 0);

        if (image) {
            let url = image.url.toString();
            // local images, not handled by DIS yet
            if (!url.startsWith('http')) {
            // create dis base url, without transformation parameters
                url = image.getImageURL({ scaleWidth: 999 }).toString().split('?')[0];
            }
            const result = {
                color: color.displayValue,
                // ideally we shouldnt manually create the dwvar_ parameter, but the variation model apis require too much overhead for a tile
                url: URLUtils.url('Product-Show', 'pid', hit.mainProductId, `dwvar_${hit.mainProductId}_${config.swatchAttribute}`, color.value),
                alt: color.displayValue,
                image: {
                    url: `${url}?${config.swatchDISConfig}`,
                },
            };
            return result;
        }
        return null;
    }).filter(Boolean);
    return {
        swatches,
    };
};

/**
 * Render the swatches template
 * @param {Object} model - The view model containing the swatches
 * @returns {string} The HTML template for the swatches
 */
exports.template = function template(model) {
    return `<div class="swatches">${model.swatches.map((swatch) => `<a href="${swatch.url}"><img src="${swatch.image.url}" alt="${swatch.alt}" /></a>`).join('')}</div>`;
};
