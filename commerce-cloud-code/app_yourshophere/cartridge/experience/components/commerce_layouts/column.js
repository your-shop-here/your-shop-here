const HashMap = require('dw/util/HashMap');
const PageRenderHelper = require('*/cartridge/experience/utilities/PageRenderHelper.js');

function renderComponent(context, modelIn) {
    const model = modelIn || new HashMap();
    const component = context.component;

    model.regions = PageRenderHelper.getRegionModelRegistry(component);
    model.style = `${context.content.style} desktop-cols-${context.content.columns} mobile-cols-${context.content.mobileColumns || '1'}" `;
    const regionNames = Array.from(Array(context.content.columns).keys()).map((index) => `column${index + 1}`);

    return `<div class="grid ${(model.style !== '' && model.style != null) ? model.style : ''}" >
        ${regionNames.map((regionName) => model.regions[regionName].render()).join('\n')}   
    </div>`;
}

/**
 * Render logic for the storefront.1 Row x 1 Col (Mobile) 1 Row x 1 Col (Desktop) layout
 * @param {dw.experience.ComponentScriptContext} context The Component script context object.
 * @param {dw.util.Map} [modelIn] Additional model values created by another cartridge. This will not be passed in by Commcerce Cloud Plattform.
 *
 * @returns {string} The markup to be displayed
 */
exports.render = function render(context, modelIn) {
    try {
        return renderComponent(context, modelIn);
    } catch (e) {
        const Logger = require('api/Logger');

        Logger.error(`Exception on rendering page designer component: ${e.message} at '${e.fileName}:${e.lineNumber}'`);
    }
    return '';
};

