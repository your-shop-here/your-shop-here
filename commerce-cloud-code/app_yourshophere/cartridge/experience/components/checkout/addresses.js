/**
 * Renders a Cart Items Component
 *
 * @param {dw.experience.ComponentScriptContext} context The component context
 * @returns {string} The template to be displayed
 */
exports.render = function render(context) {
    const result = require('*/cartridge/partials/renderer').html('checkout/addresses')({
        forceEdit: request.custom.model.forceEdit,
        addressValidation: request.custom.model.addressValidation,
        newAddress: false,
    });
    return result;
};
