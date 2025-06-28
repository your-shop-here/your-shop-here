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
function renderComponent(context) {
    const model = new HashMap();
    const page = context.page;
    model.page = page;
    model.renderParameters = JSON.parse(context.renderParameters || '{}');

    model.product = context.content.product;

    if (model.product === 'undefined') {
        return 'Product not found';
    }

    // automatically register configured regions
    const metaDefinition = require('*/cartridge/experience/pages/productTile.json');

    model.regions = new RegionModelRegistry(page, metaDefinition);

    let decorator = 'decorator/empty';

    if (PageRenderHelper.isInEditMode()) {
        require('dw/system/HookMgr').callHook('app.experience.editmode', 'editmode');
        model.resetEditPDMode = true;
        decorator = 'decorator/main';
    }

    request.custom.model = model;

    // render the page

    return require('*/api/partials').create(decorator).html({
        model, context, metaDefinition, content: model.regions.main.render(),
    });
}
