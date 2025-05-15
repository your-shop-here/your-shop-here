/**
 * Creates a model for the PDP description
 *
 * @param {Object} options - The options object
 * @param {Object} options.product - The product object
 * @param {Object} options.settings - The settings object
 * @returns {Object} The model object
 */
exports.createModel = function createModel(options) {
    const product = options.product;
    const description = (options.settings.shortOrLongDescription === 'Short_Description') ? product.shortDescription : product.longDescription;
    const model = {
        descriptionTitle: options.settings.descriptionTitle,
        description,
        divExpandedOrCompress: options.settings.divExpandedOrCompress,

    };

    return model;
};

/**
 * Renders the PDP description
 *
 * @param {Object} model - The model object
 * @returns {string} The rendered HTML
 */
exports.template = (model) => (model.description ? `${model.descriptionTitle ? `<h2>${model.descriptionTitle}</h2>` : ''}
<div class="description">${model.description}</div>` : '');
