const HashMap = require('dw/util/HashMap');
const PageRenderHelper = require('*/cartridge/experience/utilities/PageRenderHelper.js');

/**
 * Render logic for a flexible column layout with adjustable columns for desktop and mobile
 * @param {dw.experience.ComponentScriptContext} context The Component script context object.
 * @param {dw.util.Map} [modelIn] Additional model values created by another cartridge. This will not be passed in by Commcerce Cloud Plattform.
 *
 * @returns {string} The markup to be displayed
 */
function renderComponent(context, modelIn) {
    const model = modelIn || new HashMap();
    const component = context.component;

    const desktopColumns = context.content.columnConfiguration.desktopColumns;
    const columnWidths = context.content.columnConfiguration.columnWidths;
    const mobileColumnWidths = context.content.columnConfiguration.mobileColumnWidths;

    model.regions = PageRenderHelper.getRegionModelRegistry(component);
    model.style = context.content.style;
    model.cssClass = `cmp_${component.ID}`;
    model.desktopGap = context.content.columnConfiguration.desktopGap ? `gap: ${context.content.columnConfiguration.desktopGap}%` : '';
    model.mobileGap = context.content.columnConfiguration.mobileGap ? `gap: ${context.content.columnConfiguration.mobileGap}%` : '';
    const regionNames = Array.from(Array(desktopColumns).keys()).map((index) => `column${index + 1}`);

    return /* html */`<style>.${model.cssClass} { grid-template-columns: ${columnWidths.join('% ')}%; ${model.desktopGap}; }
        @media (max-width: 768px) {.${model.cssClass} { grid-template-columns: ${mobileColumnWidths.join('% ')}%; ${model.mobileGap}; }}
    </style>
    <div class="grid ${model.style} ${model.cssClass}">
        ${regionNames.map((regionName, index) => {
        let className;
        if (index === 0) {
            className = 'left';
        } else if (index === desktopColumns - 1) {
            className = 'right';
        } else {
            className = 'center';
        }
        return model.regions[regionName].setClassName(`div-${className}`).render();
    }).join('\n')}
</div>`;
}

/**
 * Render logic for a flexible column layout with adjustable columns for desktop and mobile
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

