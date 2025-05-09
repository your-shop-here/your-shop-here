
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
};

function renderComponent(context) {
    const model = new HashMap();
    const page = context.page;
    model.page = page;

    // automatically register configured regions
    const metaDefinition = require('*/cartridge/experience/pages/categoryPage.json');
    model.regions = new RegionModelRegistry(page, metaDefinition);
    model.regions.main.setClassName('page-plp');

    model.httpParameter = {};

    if (PageRenderHelper.isInEditMode()) {
        const HookManager = require('dw/system/HookMgr');
        HookManager.callHook('app.experience.editmode', 'editmode');
        model.httpParameter = {
            cgid: context.content && context.content.category && context.content.category.ID,
        };
        model.resetEditPDMode = true;
    }

    if (context.renderParameters) {
        const queryString = JSON.parse(context.renderParameters).queryString;
        model.httpParameter = queryString ? JSON.parse(`{"${queryString.replace(/&/g, '","').replace(/=/g, '":"')}"}`, (key, value) => (key === '' ? value : decodeURIComponent(value))) : [];
    }

    const ProductSearchModel = require('dw/catalog/ProductSearchModel');
    const searchModel = new ProductSearchModel();
    searchModel.setCategoryID(model.httpParameter.cgid);
    request.pageMetaData.addPageMetaTags(searchModel.pageMetaTags);

    // Determine seo meta data.
    // Used in htmlHead.isml via common/layout/page.isml decorator.
    model.CurrentPageMetaData = PageRenderHelper.getPageMetaData(page);

    request.custom.model = model;
    // render the page
    return new Template('experience/pages/pdpage').render(model).text;
}
