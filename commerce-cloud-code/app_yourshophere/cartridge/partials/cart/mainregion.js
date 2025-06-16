/**
 * Create view model for a simple content page
 * @param {dw.experience.ComponentScriptContext} context - The component context, including content and configuration.
 * @returns {Object} The view model containing the product page regionsxx
 */
exports.createModel = (input) => {
    const RegionModelRegistry = require('*/cartridge/experience/utilities/RegionModelRegistry.js');
    const Resource = require('dw/web/Resource');

    const model = input.model;
    model.error = request.httpParameterMap.error.stringValue;
    model.errorLabel = model.error ? Resource.msg(model.error, 'translations', null) : '';
    model.regions = new RegionModelRegistry(input.context.page, input.metaDefinition);
    return model;
};

/**
 * Render a product tile name
 * @param {Object} model - The view model containing product details
 * @returns {string} The HTML template for the product tile name
 */
exports.template = (model) => `
    ${!empty(model.error) ? `
        <div class="cart-error-message">
            <p>${model.errorLabel}</p>
        </div>` : ''}
    ${model.regions.main.render()}`;
