const PageRenderHelper = require('*/cartridge/experience/utilities/PageRenderHelper.js');

/**
 * Renders a Product Quantity And Optionts Component
 *
 * @param {dw.experience.ComponentScriptContext} context The component context
 * @returns {string} The template to be displayed
 */
exports.render = function render(context) {
    return require('*/cartridge/partials/renderer').create('pdp/actions').html({
        regions: PageRenderHelper.getRegionModelRegistry(context.component),
        settings: context.content,
        product: request.custom.model.product,
    });
};

