/**
 * Renders a Product Description Component
 *
 * @param {dw.experience.ComponentScriptContext} context The component context
 * @returns {string} The template to be displayed
 */
exports.render = function render(context) {
    const model = request.custom.tileModel;
    const imageDimension = request.custom.tileModel.config.imageDimension;

    model.imageFilter = {
        key: imageDimension,
        value: request.custom.model.renderParameters[imageDimension],
    };

    model.config.put('imageDISConfig', context.content.imageDISConfig);

    return require('*/api/partials').create('tile/image').html({
        model,
    });
};
