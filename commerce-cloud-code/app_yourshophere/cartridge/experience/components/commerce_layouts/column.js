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
    const legacyMode = context.content.columnConfiguration === undefined;

    // TODO: Remove legacyMode and use columnConfiguration instead
    const desktopColumns = legacyMode ? context.content.columns : context.content.columnConfiguration.desktopColumns;
    const mobileColumns = legacyMode ? context.content.mobileColumns || 1 : context.content.columnConfiguration.mobileColumns;
    const columnWidths = legacyMode ? Array.from(Array(desktopColumns).keys()).map(() => (100 / desktopColumns)) : context.content.columnConfiguration.columnWidths;
    const mobileColumnWidths = legacyMode ? Array.from(Array(mobileColumns).keys()).map(() => (100 / mobileColumns)) : context.content.columnConfiguration.mobileColumnWidths;

    model.regions = PageRenderHelper.getRegionModelRegistry(component);
    model.style = legacyMode ? `${context.content.style} desktop-cols-${context.content.columns} mobile-cols-${context.content.mobileColumns || '1'}" ` : context.content.style;
    model.cssClass = legacyMode ? '' : `cmp_${component.ID}`;
    const regionNames = Array.from(Array(desktopColumns).keys()).map((index) => `column${index + 1}`);

    return /* html */`<style>.${model.cssClass} { grid-template-columns: ${columnWidths.join('% ')}%; }
        @media (max-width: 768px) {.${model.cssClass} { grid-template-columns: ${mobileColumnWidths.join('% ')}%; }}
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

