/**
 * Renders the add to cart button for the tile
 *
 * @param {dw.experience.ComponentScriptContext} context The component context
 * @returns {string} The template to be displayed
 */
exports.render = function render(context) {
    const model = request.custom.model;
    model.label = context.content.addToCartButtonLabel;

    return require('*/api/partials').create('tile/addtocartbutton').html({
        model,
    });
};
