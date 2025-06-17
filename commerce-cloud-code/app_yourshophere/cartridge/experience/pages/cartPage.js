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
    const page = context.page;
    model.page = page;

    model.basket = context.content.basket;
    // adds product to basket if basket is empty and we are in edit mode
    PageRenderHelper.initializeBasketIfEmpty(model.basket);

    // automatically register configured regions
    const metaDefinition = require('*/cartridge/experience/pages/cartPage.json');

    model.regions = new RegionModelRegistry(page, metaDefinition);
    model.regions.main.setClassName('page-cart');

    // Set page metadata
    request.pageMetaData.setTitle(page.pageTitle);
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
        model.httpParameter = queryString ? JSON.parse(`{"${queryString.replace(/&/g, '","').replace(/=/g, '":"')}"}`, (key, value) => (key === '' ? value : decodeURIComponent(value))) : {};
    }
    request.custom.model = model;
    // render the page

    return new Template('experience/pages/cartpage').render(model).text;
}
