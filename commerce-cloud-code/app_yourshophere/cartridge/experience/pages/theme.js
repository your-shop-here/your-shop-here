const Template = require('dw/util/Template');
const HashMap = require('dw/util/HashMap');
const PageRenderHelper = require('*/cartridge/experience/utilities/PageRenderHelper.js');
const RegionModelRegistry = require('*/cartridge/experience/utilities/RegionModelRegistry.js');

/**
 * Render logic for the theme page, which can be partially included oon the rest of the website
 *
 * @param {dw.experience.PageScriptContext} context The page script context object.
 *
 * @returns {string} The template text
 */
exports.render = function render(context) {
    require('*/api/Cache').days(14);
    try {
        return renderComponent(context);
    } catch (e) {
        const Logger = require('*/api/Logger');
        Logger.error(`Exception on rendering page designer component: ${e.message} at '${e.fileName}:${e.lineNumber}'`);
    }
    return '';
};

function renderComponent (context) {
    const model = new HashMap();
    const page = context.page;

    model.page = page;

    // automatically register configured regions
    const metaDefinition = require('*/cartridge/experience/pages/theme.json');
    model.regions = new RegionModelRegistry(page, metaDefinition);

    // Set page metadata
    request.pageMetaData.setTitle(page.pageTitle);
    request.pageMetaData.setDescription(page.pageDescription);
    request.pageMetaData.setKeywords(page.pageKeywords);

    if (PageRenderHelper.isInEditMode()) {
        const HookManager = require('dw/system/HookMgr');
        HookManager.callHook('app.experience.editmode', 'editmode');
        model.resetEditPDMode = true;
        model.isInEditMode = true;
    } else {
        const parameters = JSON.parse(context.renderParameters);
        model.isInEditMode = false;
        Object.keys(parameters).forEach((name) => {
            model[name] = parameters[name];
        });
    }

    // render the page
    return new Template('decorator/pdtheme').render(model).text;
};
