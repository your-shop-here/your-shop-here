/**
 * Renders a Product Description Component
 *
 * @param {dw.experience.ComponentScriptContext} context The component context
 * @returns {string} The template to be displayed
 */
exports.render = function render() {
    const model = request.custom.tileModel;

    return require('*/api/partials').create('tile/price').html({
        model,
    });
};
