/**
 * Renders a Product productPrices Component
 *
 * @param {dw.experience.ComponentScriptContext} context The component context
 * @returns {string} The template to be displayed
 */
exports.render = function render(context) {
    return require('*/api/partials').create('pdp/prices').html({
        product: request.custom.model.product,
        settings: context.content,
    });
};
