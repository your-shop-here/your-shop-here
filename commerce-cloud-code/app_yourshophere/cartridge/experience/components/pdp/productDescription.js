/**
 * Renders a Product Description Component
 *
 * @param {dw.experience.ComponentScriptContext} context The component context
 * @returns {string} The template to be displayed
 */
exports.render = function render(context) {
    return require('*/api/partials').create('pdp/description').html({
        product: request.custom.model.product,
        settings: context.content,
    });
};
