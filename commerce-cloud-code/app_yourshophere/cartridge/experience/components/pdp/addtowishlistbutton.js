/**
 * Renders an Add to Wishlist Button Component
 *
 * @param {dw.experience.ComponentScriptContext} context The component context
 * @returns {string} The template to be displayed
 */
exports.render = function render(context) {
    return require('*/api/partials').create('pdp/addtowishlistbutton').html(request.custom.model.product, {
        settings: context.content,
        buttonStyle: context.content.buttonStyle || 'primary',
        buttonText: context.content.buttonText || '',
    });
};
