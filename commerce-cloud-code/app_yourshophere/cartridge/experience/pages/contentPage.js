const Template = require('dw/util/Template');
const HashMap = require('dw/util/HashMap');
const PageRenderHelper = require('*/cartridge/experience/utilities/PageRenderHelper.js');
const RegionModelRegistry = require('*/cartridge/experience/utilities/RegionModelRegistry.js');

/**
 * Render logic for the storepage.
 *
 * @param {dw.experience.PageScriptContext} context The page script context object.
 *
 * @returns {string} The template text
 */
exports.render = function render(context) {
    require('api/Cache').days(14);
    try {
        return renderComponent(context);
    } catch (e) {
        const Logger = require('api/Logger');
        Logger.error(`Exception on rendering page designer component: ${e.message} at '${e.fileName}:${e.lineNumber}'`);
    }

    return '';
};

function renderComponent (context) {
    const model = new HashMap();
    const Site = require('dw/system/Site');
    const page = context.page;
    model.page = page;

    // automatically register configured regions
    const metaDefinition = require('*/cartridge/experience/pages/contentPage.json');
    model.regions = new RegionModelRegistry(page, metaDefinition);
    model.regions.main.setClassName('page-content');

    // Determine seo meta data.
    // Used in htmlHead.isml via common/layout/page.isml decorator.
    model.CurrentPageMetaData = PageRenderHelper.getPageMetaData(page);
    model.CurrentPageMetaData = {};
    model.CurrentPageMetaData.title = page.pageTitle || Site.current.name;
    model.CurrentPageMetaData.description = page.pageDescription;
    model.CurrentPageMetaData.keywords = page.pageKeywords;

    if (PageRenderHelper.isInEditMode()) {
        const HookManager = require('dw/system/HookMgr');
        HookManager.callHook('app.experience.editmode', 'editmode');
        model.resetEditPDMode = true;
    }

    model.httpParameter = {};

    if (context.renderParameters) {
        const queryString = JSON.parse(context.renderParameters).queryString;
        if (queryString) {
            model.httpParameter = JSON.parse(`{"${queryString.replace(/&/g, '","').replace(/=/g, '":"')}"}`,
                (key, value) => (key === '' ? value : decodeURIComponent(value)),
            );
        } else {
            model.httpParameter = {};
        }
    }

    // render the page
    return new Template('experience/pages/pdpage').render(model).text;
}
