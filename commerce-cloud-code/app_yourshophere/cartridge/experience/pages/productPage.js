const Template = require('dw/util/Template');
const HashMap = require('dw/util/HashMap');
const PageRenderHelper = require('*/cartridge/experience/utilities/PageRenderHelper.js');
const RegionModelRegistry = require('*/cartridge/experience/utilities/RegionModelRegistry.js');

/**
 * Render logic for the storepage.
 *
 * @todo Refactor to not use ISML
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

/**
 * Renders the product page component
 * @param {Object} context - The context object
 * @returns {string} The rendered HTML
 */
function renderComponent (context) {
    const model = new HashMap();
    const page = context.page;
    model.page = page;

    model.product = context.content.product;

    if (model.product === 'undefined') {
        return 'Product not found';
    }

    // automatically register configured regions
    const metaDefinition = require('*/cartridge/experience/pages/productPage.json');

    model.regions = new RegionModelRegistry(page, metaDefinition);
    model.regions.main.setClassName('page-pdp');

    // Determine seo meta data.
    // Used in htmlHead.isml via common/layout/page.isml decorator.
    const pageMetaData = require('*/cartridge/middleware/pageMetaData');

    model.CurrentPageMetaData = request.pageMetaData;

    // does it make sense to ignore page meta data?
    pageMetaData.setPageMetaData(model.CurrentPageMetaData, model.product);
    pageMetaData.setPageMetaTags(model.CurrentPageMetaData, model.product);

    if (PageRenderHelper.isInEditMode()) {
        require('dw/system/HookMgr').callHook('app.experience.editmode', 'editmode');
        model.resetEditPDMode = true;
    }

    model.httpParameter = {};

    if (context.renderParameters) {
        const queryString = JSON.parse(context.renderParameters).queryString;
        model.httpParameter = JSON.parse(`{"${queryString.replace(/&/g, '","').replace(/=/g, '":"')}"}`, (key, value) => (key === '' ? value : decodeURIComponent(value)));
    }
    request.custom.model = model;
    // render the page

    return new Template('experience/pages/pdpage').render(model).text;
}
