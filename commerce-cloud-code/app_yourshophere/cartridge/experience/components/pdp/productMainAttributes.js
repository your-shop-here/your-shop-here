/**
 * Renders a Product productMainAttributes Component
 *
 * @param {dw.experience.ComponentScriptContext} context The component context
 * @returns {string} The template to be displayed
 */
exports.render = function render() {
    return require('*/api/partials').html('pdp/variationAttributes')(request.custom.model.product);
};
