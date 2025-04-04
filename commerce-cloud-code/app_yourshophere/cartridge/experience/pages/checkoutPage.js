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
        const Logger = require('api/Logger');
        Logger.error(`Exception on rendering page designer component: ${e.message} at '${e.fileName}:${e.lineNumber}'`);
    }
};

function renderComponent(context) {
    const BasketMgr = require('dw/order/BasketMgr');
    const model = new HashMap();
    const page = context.page;
    const metaDefinition = require('*/cartridge/experience/pages/checkoutPage.json');
    request.custom.model = new HashMap();
    request.custom.model.forceEdit = context.renderParameters && JSON.parse(context.renderParameters).forceEdit;
    model.regions = new RegionModelRegistry(page, metaDefinition);
    return template(model);
}

function template(model) {
    return `<!DOCTYPE html><html lang="${model.lang}" data-theme="light">

    <head>
        ${require('partials').html('global/htmlhead')()}
        ${require('*/cartridge/experience/skin.js').renderSkin()}
    </head>
    <main>
        ${model.regions.header.render()}
        ${model.regions.main.render()}
        ${model.regions.footer.render()}
    </main>
    <script src="https://unpkg.com/htmx.org@1.9.6"></script>

    <html>`;
}
