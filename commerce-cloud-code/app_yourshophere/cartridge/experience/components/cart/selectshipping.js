/**
 * Renders the Select Shipping Component
 *
 * @param {dw.experience.ComponentScriptContext} context The component context
 * @returns {string} The template to be displayed
 */
exports.render = function render(context) {
    return require('*/api/partials').create('cart/selectshipping').html({
        settings: context.content,
    });
};
