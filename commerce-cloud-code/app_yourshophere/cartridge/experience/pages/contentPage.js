const HashMap = require('dw/util/HashMap');
const PageRenderHelper = require('*/cartridge/experience/utilities/PageRenderHelper.js');
const RegionModelRegistry = require('*/cartridge/experience/utilities/RegionModelRegistry.js');

/**
 * Render logic for the content page.
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

function renderComponent(context) {
    const model = new HashMap();
    const Site = require('dw/system/Site');
    const page = context.page;
    model.page = page;

    // automatically register configured regions
    const metaDefinition = require('*/cartridge/experience/pages/contentPage.json');
    model.regions = new RegionModelRegistry(page, metaDefinition);
    model.regions.main.setClassName('page-content');

    // Set page metadata
    model.pageMetaData = PageRenderHelper.getPageMetaData(page);
    request.pageMetaData.setTitle(page.pageTitle || Site.current.name);
    request.pageMetaData.setDescription(page.pageDescription);
    request.pageMetaData.setKeywords(page.pageKeywords);

    if (PageRenderHelper.isInEditMode()) {
        const HookManager = require('dw/system/HookMgr');
        HookManager.callHook('app.experience.editmode', 'editmode');
        model.resetEditPDMode = true;
    }

    model.httpParameter = {};

    if (context.renderParameters) {
        const queryString = JSON.parse(context.renderParameters).queryString;
        if (queryString) {
            model.httpParameter = JSON.parse(
                `{"${queryString.replace(/&/g, '","').replace(/=/g, '":"')}"}`,
                (key, value) => (key === '' ? value : decodeURIComponent(value)),
            );
        } else {
            model.httpParameter = {};
        }
    }

    return require('*/api/partials').create('content/mainregion').decorateWith('decorator/main').html({
        model, context, metaDefinition,
    });
}
