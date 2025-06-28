/**
 * Renders a Product Description Component
 *
 * @param {dw.experience.ComponentScriptContext} context The component context
 * @returns {string} The template to be displayed
 */
exports.render = function render(context) {
    const model = request.custom.tileModel;
    model.label = context.content.addToCartButtonLabel;

    return require('*/api/partials').create('tile/addtocartbutton').html({
        model,
    });
};
