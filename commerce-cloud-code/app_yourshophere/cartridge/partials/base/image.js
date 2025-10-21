/**
 * Creates a model for the base image component
 *
 * @param {Object} options - The options object
 * @param {Object} options.image - The image object
 * @param {string} options.width - The width of the image
 * @param {string} options.link - The optional link URL
 * @returns {Object} The model object
 */
exports.createModel = function createModel(options) {
    const model = {
        imageUrl: options.image.URL,
        width: options.width || '100%',
        link: options.link,
    };
    return model;
};

/**
 * Renders the base image component
 *
 * @param {Object} model - The model object
 * @returns {string} The rendered HTML
 */
exports.template = (model) => {
    const imageHtml = `<img src="${model.imageUrl}" style="width:${model.width}; margin-left:auto;"/>`;

    if (model.link) {
        return `<a href="${model.link}">${imageHtml}</a>`;
    }

    return imageHtml;
};
