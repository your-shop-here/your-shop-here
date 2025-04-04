/**
 * Renders the Select Shipping Component
 *
 * @param {dw.experience.ComponentScriptContext} context The component context
 * @returns {string} The template to be displayed
 */
exports.render = function render(context) {
    return require('*/cartridge/partials/renderer').html('cart/selectshipping')({
        settings: context.content,
    });
};
