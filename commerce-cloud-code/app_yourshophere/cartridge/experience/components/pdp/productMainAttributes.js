/**
 * Renders a Product productMainAttributes Component
 *
 * @param {dw.experience.ComponentScriptContext} context The component context
 * @returns {string} The template to be displayed
 */
exports.render = function render() {
    return require('*/api/partials').create('pdp/variationAttributes').html(request.custom.model.product);
};
