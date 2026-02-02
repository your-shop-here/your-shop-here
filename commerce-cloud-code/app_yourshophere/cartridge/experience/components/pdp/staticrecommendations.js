/**
 * Renders a Bundle or Set Products Component
 *
 * @param {dw.experience.ComponentScriptContext} context The component context
 * @returns {string} The template to be displayed
 */
exports.render = function render(context) {
    const instance = require('*/api/partials').create('pdp/staticrecommendations');
    return instance.html({
        product: request.custom.model.product,
        settings: context.content,
    });
};
