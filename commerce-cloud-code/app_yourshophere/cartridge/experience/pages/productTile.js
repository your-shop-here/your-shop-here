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

    const HttpSearchParams = require('*/api/URLSearchParams');
    let httpParams = new HttpSearchParams(model.renderParameters);
    if (!httpParams.get('pid')) {
        httpParams = new HttpSearchParams({ pid: model.product.ID });
    }
    model.searchParameters = httpParams;
    const componentSettings = require('*/cartridge/utils/ComponentSettings').get(httpParams.get('component'));

    const tileSearch = require('*/api/ProductSearchModel').get(httpParams, { swatchAttribute: componentSettings.swatchDimension });
    tileSearch.search();

    const hit = tileSearch.foundProducts[0];
    model.hit = hit;
    model.search = tileSearch;

    // automatically register configured regions
    const metaDefinition = require('*/cartridge/experience/pages/productTile.json');

    model.regions = new RegionModelRegistry(page, metaDefinition);

    let decorator = 'decorator/empty';

    if (PageRenderHelper.isInEditMode()) {
        require('dw/system/HookMgr').callHook('app.experience.editmode', 'editmode');
        model.resetEditPDMode = true;
        decorator = 'decorator/main';
    }

    model.analytics = JSON.stringify({
        type: 'productView',
        id: hit.object.productID,
    });
    model.analyticsContribution = JSON.stringify({
        contributesTo: [
            'viewCategory',
            'viewSearch',
        ],
        contributionOptions: { property: 'products', mode: 'array-push' },
        value: {
            id: hit.object.productID,
            sku: '',
            altId: '',
            altIdType: '',
        },
    });

    model.config = context.content;
    request.custom.model = model;
    // render the page
    // data-include-url="${request.httpQueryString}" data-analytics='${model.analytics}' data-analytics-contribution='${model.analyticsContribution}'
    let markup = require('*/api/partials').create('tile/tile').decorateWith(decorator).html({
        model,
    });
    // remove the custom-deleteme tags if not in edit mode
    if (!PageRenderHelper.isInEditMode()) {
        markup = markup.replace(/<custom-deleteme.*?>/, '');
        markup = markup.replace(/<\/custom-deleteme>/, '');
    }
    return markup;
}
