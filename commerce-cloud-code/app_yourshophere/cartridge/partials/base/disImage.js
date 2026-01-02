/**
 * Creates a model for the DIS image component
 *
 * @param {Object} options - The options object
 * @param {string} options.imageUrl - The image URL (may include Dynamic Imaging Service parameters)
 * @param {string} options.altText - The alt text for the image
 * @param {string} options.link - The optional link URL
 * @param {string} options.width - The width of the image
 * @returns {Object} The model object
 */
exports.createModel = function createModel(options) {
    const model = {
        imageUrl: options.imageUrl || '',
        altText: options.altText || '',
        link: options.link || null,
        width: options.width || '100%',
    };
    return model;
};

/**
 * Renders the DIS image component
 *
 * @param {Object} model - The model object
 * @returns {string} The rendered HTML
 */
exports.template = function template(model) {
    // Don't render anything if no image URL is provided
    if (!model.imageUrl) {
        return '<div style="padding: 2rem; text-align: center; color: #999;">No image selected. Please select an image using the Image Manager.</div>';
    }

    const imageHtml = `<img src="${model.imageUrl}" alt="${model.altText}" style="width: ${model.width}; max-width: 100%; height: auto; display: block;" loading="lazy" />`;

    // Wrap in link if provided
    if (model.link) {
        return `<a href="${model.link}">${imageHtml}</a>`;
    }

    return imageHtml;
};

