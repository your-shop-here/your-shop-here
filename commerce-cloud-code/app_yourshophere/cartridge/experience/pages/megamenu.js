
const Template = require('dw/util/Template');
const HashMap = require('dw/util/HashMap');
const PageRenderHelper = require('*/cartridge/experience/utilities/PageRenderHelper.js');
const RegionModelRegistry = require('*/cartridge/experience/utilities/RegionModelRegistry.js');

/**
 * Render logic for the mega menu virtual page
 *
 * @param {dw.experience.PageScriptContext} context The page script context object.
 *
 * @returns {string} The template text
 */
exports.render = function render(context) {
    try {
        return renderComponent(context);
    } catch (e) {
        const Logger = require('*/api/Logger');
        Logger.error(`Exception on rendering page designer component: ${e.message} at '${e.fileName}:${e.lineNumber}'`);
    }
};

function renderComponent(context) {
    const model = new HashMap();
    const page = context.page;

    model.page = page;

    // automatically register configured regions
    const metaDefinition = require('*/cartridge/experience/pages/megamenu.json');
    model.regions = new RegionModelRegistry(page, metaDefinition);

    if (PageRenderHelper.isInEditMode()) {
        const HookManager = require('dw/system/HookMgr');
        HookManager.callHook('app.experience.editmode', 'editmode');
        model.resetEditPDMode = true;
        model.isInEditMode = true;
    } else {
        const parameters = JSON.parse(context.renderParameters);
        model.isInEditMode = false;
        // eslint-disable-next-line no-restricted-syntax, guard-for-in
        for (const name in parameters) {
            model[name] = parameters[name];
        }
    }

    // render the page
    return new Template('experience/pages/megamenu').render(model).text;
}
