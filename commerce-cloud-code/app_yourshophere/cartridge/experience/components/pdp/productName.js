/**
 * Renders a Product productName Component
 *
 * @param {dw.experience.ComponentScriptContext} context The component context
 * @returns {string} The template to be displayed
 */
exports.render = function render() {
    return require('*/api/partials').html('pdp/name')(request.custom.model.product);
};

