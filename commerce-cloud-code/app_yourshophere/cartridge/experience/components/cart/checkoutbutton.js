/**
 * Renders a Checkout button Component
 *
 * @param {dw.experience.ComponentScriptContext} context The component context
 * @returns {string} The template to be displayed
 */
exports.render = function render(context) {
    return require('*/api/partials').create('cart/checkoutbutton').html({
        settings: context.content,
    });
};
