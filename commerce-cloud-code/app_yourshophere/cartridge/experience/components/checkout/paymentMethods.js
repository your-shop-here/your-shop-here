/**
 * Renders a Cart Items Component
 *
 * @param {dw.experience.ComponentScriptContext} context The component context
 * @returns {string} The template to be displayed
 */
exports.render = function render(context) {
    const result = require('*/cartridge/partials/renderer').html('checkout/paymentMethods')({
        forceEdit: request.custom.model.forceEdit,
        settings: context.content,
    });
    return result;
};
