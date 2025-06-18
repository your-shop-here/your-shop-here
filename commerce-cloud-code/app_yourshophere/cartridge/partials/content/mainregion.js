/**
 * Create view model for a simple content page
 * @param {dw.experience.ComponentScriptContext} context - The component context, including content and configuration.
 * @returns {Object} The view model containing the product page regionsxx
 */
exports.createModel = (input) => {
    const RegionModelRegistry = require('*/cartridge/experience/utilities/RegionModelRegistry.js');

    const model = input.model;
    model.regions = new RegionModelRegistry(input.context.page, input.metaDefinition);
    return model;
};

/**
 * Render a product tile name
 * @param {Object} model - The view model containing product details
 * @returns {string} The HTML template for the product tile name
 */
exports.template = (model) => `${model.regions.main.render()}`;
