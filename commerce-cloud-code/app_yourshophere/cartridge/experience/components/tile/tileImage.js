/**
 * Renders the image for the tile
 * @param {Object} context - The component context
 * @returns {string} The HTML template for the image
 */
exports.render = function render(context) {
    const model = request.custom.model;
    const imageDimension = model.config.imageDimension;

    model.imageFilter = {
        key: imageDimension,
        value: request.custom.model.renderParameters[imageDimension],
    };

    model.config.put('imageDISConfig', context.content.imageDISConfig);

    return require('*/api/partials').create('tile/image').html({
        model,
    });
};
