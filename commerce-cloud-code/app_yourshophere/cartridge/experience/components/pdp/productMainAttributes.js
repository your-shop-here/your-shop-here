/**
 * Renders a Product productMainAttributes Component
 *
 * @param {dw.experience.ComponentScriptContext} context The component context
 * @returns {string} The template to be displayed
 */
exports.render = function render(context) {
    const product = request.custom.model && request.custom.model.product ? request.custom.model.product : null;
    const swatchDimension = context.content && context.content.swatchDimension ? context.content.swatchDimension : '';
    const swatchViewType = context.content && context.content.swatchViewType ? context.content.swatchViewType : '';
    const swatchDISConfig = context.content && context.content.swatchDISConfig ? context.content.swatchDISConfig : '';
    return require('*/api/partials').create('pdp/variationAttributes').html({
        product,
        swatchDimension,
        swatchViewType,
        swatchDISConfig,
    });
};
