/**
 * Renders a Product productPromo Component
 *
 * @param {dw.experience.ComponentScriptContext} context The component context
 * @returns {string} The template to be displayed
 */
exports.render = function render(context) {
    return require('*/api/partials').html('pdp/promotions')({
        product: request.custom.model.product,
        settings: context.content,
    });
};
