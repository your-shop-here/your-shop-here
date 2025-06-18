const HashMap = require('dw/util/HashMap');
const PageRenderHelper = require('*/cartridge/experience/utilities/PageRenderHelper.js');
const RegionModelRegistry = require('*/cartridge/experience/utilities/RegionModelRegistry.js');

/**
 * Renders the Order Totals Component
 *
 * @param {dw.experience.ComponentScriptContext} context The component context
 * @returns {string} The template to be displayed
 */
exports.render = function render(context) {
    const model = new HashMap();
    const component = context.component;
    const metaDefinition = require('*/cartridge/experience/components/tracking/trackingregion.json');
    model.regions = new RegionModelRegistry(component, metaDefinition);
    let hint = '';
    if (PageRenderHelper.isInEditMode()) {
        hint += 'Tracking Support';
    }

    const providersHtml = model.regions.providers.render();
    return hint + require('*/api/partials').create('tracking/trackingregion').html(providersHtml);
};
