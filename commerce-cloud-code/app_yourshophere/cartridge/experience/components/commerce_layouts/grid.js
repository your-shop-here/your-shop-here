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

    model.selector = context.content.applyGridToNestedComponent ? '> .experience-region > .experience-component' : '> .experience-region';
    model.desktopGap = context.content.columnConfiguration.desktopGap ? `gap: ${context.content.columnConfiguration.desktopGap}%` : '';
    model.mobileGap = context.content.columnConfiguration.mobileGap ? `gap: ${context.content.columnConfiguration.mobileGap}%` : '';

    return /* html */`<style>.${model.cssClass} ${model.selector} { display: grid; ${model.desktopGap}; grid-template-columns: ${columnWidths.join('% ')}%; }
        @media (max-width: 768px) {.${model.cssClass} ${model.selector} { display: grid; gap: ${model.mobileGap}; grid-template-columns: ${mobileColumnWidths.join('% ')}%; }}
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

