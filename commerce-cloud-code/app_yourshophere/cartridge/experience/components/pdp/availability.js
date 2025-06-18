/**
 * Renders a Product Availability Component
 *
 * @param {dw.experience.ComponentScriptContext} context The component context
 * @returns {string} The template to be displayed
 */
exports.render = function render() {
    const URLUtils = require('dw/web/URLUtils');
    return `<wainclude url="${URLUtils.url('Product-Availability', 'pid', request.custom.model.product.ID)}" />`;
};
