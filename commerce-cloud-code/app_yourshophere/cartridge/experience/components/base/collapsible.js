/**
 * Renders a collapsible region
 *
 * @param {dw.experience.ComponentScriptContext} context The component context
 * @returns {string} The template to be displayed
 */
exports.render = function render(context) {
    const PageRenderHelper = require('*/cartridge/experience/utilities/PageRenderHelper.js');
    return require('*/cartridge/partials/renderer').html('base/collapsible')({
        settings: context.content,
        regions: PageRenderHelper.getRegionModelRegistry(context.component),
    });
};
