const HashMap = require('dw/util/HashMap');
const PageRenderHelper = require('*/cartridge/experience/utilities/PageRenderHelper.js');
const RegionModelRegistry = require('*/cartridge/experience/utilities/RegionModelRegistry.js');

/**
 * The product page - this is used to render the product page
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
function renderComponent(context) {
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

    // Set page metadata
    pageMetaData.setPageMetaData(request.pageMetaData, model.product);
    pageMetaData.setPageMetaTags(request.pageMetaData, model.product);

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

    return require('*/api/partials').create('decorator/main').html({
        model, context, metaDefinition, content: model.regions.main.render(),
    });
}
