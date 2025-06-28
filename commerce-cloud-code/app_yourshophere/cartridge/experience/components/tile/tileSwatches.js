/**
 * Renders a Product Description Component
 *
 * @param {dw.experience.ComponentScriptContext} context The component context
 * @returns {string} The template to be displayed
 */
exports.render = function render(context) {
    const model = request.custom.model;
    model.config.put('swatchDISConfig', context.content.swatchDISConfig);
    model.config.put('swatchViewType', context.content.swatchViewType);
    return require('*/api/partials').create('tile/swatches').html({
        model,
    });
};
