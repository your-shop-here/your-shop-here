/**
 * Creates a model for the PDP images slider
 *
 * @param {Object} options - The options object
 * @param {Object} options.product - The product object
 * @param {Object} options.settings - The settings object
 * @param {string} options.settings.viewType - The view type
 * @param {number} options.settings.imageCount - The number of images to display
 * @returns {Object} The model object
 */
exports.createModel = function createModel(options) {
    let imageSource = options.product;
    if (options.product.variant || options.product.master) {
        imageSource = require('./variationAttributes').getVariationModel(options.product);
    }

    const model = {
        images: imageSource.getImages(options.settings.viewType).toArray()
            .slice(0, options.settings.imageCount).map((image, index) => ({
                url: image.url,
                alt: image.alt,
                id: `slide-${index + 1}`, // Add unique ID for each slide
            })),
    };
    return model;
};

/**
 * Renders the PDP images slider
 *
 * @param {Object} model - The model object
 * @returns {string} The rendered HTML
 */
exports.template = model => `
    <div class="image-slider">
        <div class="slider-viewport">
            <ul class="slider-track">
                ${model.images.map(image => `
                    <li class="slide" id="${image.id}">
                        <input type="radio" name="slider" id="${image.id}-radio" ${image.id === 'slide-1' ? 'checked' : ''}>
                        <img src="${image.url}" alt="${image.alt}" />
                    </li>
                `).join('\n')}
            </ul>
        </div>
        <div class="slider-nav">
            ${model.images.map(image => `
                <label for="${image.id}-radio" class="nav-dot"></label>
            `).join('\n')}
        </div>
    </div>
`;
