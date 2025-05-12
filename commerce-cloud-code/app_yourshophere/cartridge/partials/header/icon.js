/**
 * Creates the model for the icon
 * @param {Object} params - The parameters for the model
 * @returns {Object} The model for the icon
 */
function createModel(params) {
    return {
        image: params.image,
        width: params.width,
        height: params.height,
        link: params.link,
    };
}

/**
 * Renders the icon template
 * @param {Object} model - The model for the icon
 * @returns {string} The rendered HTML
 */
function template(model) {
    if (model.link) {
        return `<a href="${model.link}"><img src="${model.image.URL}" style="width:${model.width}; height:${model.height}; margin-left:auto;" alt=""/></a>`;
    }
    return `<img src="${model.image.URL}" style="width:${model.width}; margin-left:auto;" alt=""/>`;
}

module.exports = {
    createModel,
    template,
};
