/**
 * Renders a Cart Items Component
 *
 * @param {dw.experience.ComponentScriptContext} context The component context
 * @returns {string} The template to be displayed
 */
exports.render = function render(context) {
    const result = require('*/api/partials').create('checkout/addresses').html({
        forceEdit: request.custom.model.forceEdit,
        addressValidation: request.custom.model.addressValidation,
        newAddress: false,
    });
    return result;
};
