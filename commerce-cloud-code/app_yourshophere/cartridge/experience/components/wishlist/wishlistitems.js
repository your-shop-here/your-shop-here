/**
 * Renders a Wishlist Items Component
 *
 * @param {dw.experience.ComponentScriptContext} context The component context
 * @returns {string} The template to be displayed
 */
exports.render = function render(context) {
    return require('*/api/partials').create('wishlist/wishlistitems').html({
        settings: context.content,
        buttonStyle: context.content.buttonStyle || 'primary',
        enableRemove: typeof context.content.enableRemove === 'undefined' ? true : context.content.enableRemove,
        addToCartText: context.content.addToCartText || '',
    });
};
