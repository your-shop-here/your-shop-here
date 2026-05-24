/**
 * Renders a Cart Items Component
 *
 * @param {dw.experience.ComponentScriptContext} context The component context
 * @returns {string} The template to be displayed
 */
// eslint-disable-next-line no-unused-vars
exports.render = function render(context) {
    const result = require('*/api/partials').create('checkout/addresses').html({
        forceEdit: request.custom.model.forceEdit,
        addressValidation: request.custom.model.addressValidation,
        newAddress: false,
    });
    return result;
};
