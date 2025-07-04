const HashMap = require('dw/util/HashMap');
const PageRenderHelper = require('*/cartridge/experience/utilities/PageRenderHelper.js');

/**
 * Render logic for a grid layout supporting a number of columns for desktop and mobile
 * @param {dw.experience.ComponentScriptContext} context The Component script context object.
 * @param {dw.util.Map} [modelIn] Additional model values created by another cartridge. This will not be passed in by Commcerce Cloud Plattform.
 *
 * @returns {string} The markup to be displayed
 */
function renderComponent(context, modelIn) {
    const model = modelIn || new HashMap();
    const component = context.component;

    const columnWidths = context.content.columnConfiguration.columnWidths;
    const mobileColumnWidths = context.content.columnConfiguration.mobileColumnWidths;

    model.regions = PageRenderHelper.getRegionModelRegistry(component);
    model.cssClass = `cmp_${component.ID}`;

    const modelSelector = context.content.applyGridToNestedComponent ? '> .experience-region > .experience-component' : '> .experience-region';

    return /* html */`<style>.${model.cssClass} ${modelSelector} { display: grid; gap: 1rem; grid-template-columns: ${columnWidths.join('% ')}%; }
        @media (max-width: 768px) {.${model.cssClass} ${modelSelector} { display: grid; gap: 1rem; grid-template-columns: ${mobileColumnWidths.join('% ')}%; }}
    </style>
    <div class="grid ${model.cssClass}">
        ${model.regions.main.render()}
    </div>`;
}

/**
 * Render logic for a grid layout supporting a number of columns for desktop and mobile
 * @param {dw.experience.ComponentScriptContext} context The Component script context object.
 * @param {dw.util.Map} [modelIn] Additional model values created by another cartridge. This will not be passed in by Commcerce Cloud Plattform.
 *
 * @returns {string} The markup to be displayed
 */
exports.render = function render(context, modelIn) {
    try {
        return renderComponent(context, modelIn);
    } catch (e) {
        const Logger = require('*/api/Logger');

        Logger.error(`Exception on rendering page designer component: ${e.message} at '${e.fileName}:${e.lineNumber}'`);
    }
    return '';
};

