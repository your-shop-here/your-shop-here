/**
 * Renders a Product Description Component
 *
 * @param {dw.experience.ComponentScriptContext} context The component context
 * @returns {string} The template to be displayed
 */
exports.render = function render(context) {
    const RegionModelRegistry = require('*/cartridge/experience/utilities/RegionModelRegistry.js');
    const metaDefinition = require('*/cartridge/experience/components/tile/productTile.json');

    const model = {};
    model.regions = new RegionModelRegistry(context.component, metaDefinition);
    model.config = context.content;

    const HttpSearchParams = require('*/api/URLSearchParams');
    let httpParams = new HttpSearchParams(request.custom.model.renderParameters);
    if (!httpParams.get('pid')) {
        httpParams = new HttpSearchParams({ pid: request.custom.model.product.ID });
    }
    model.searchParameters = httpParams;
    const componentSettings = require('*/cartridge/utils/ComponentSettings').get(httpParams.get('component'));

    const tileSearch = require('*/api/ProductSearchModel').get(httpParams, { swatchAttribute: componentSettings.swatchDimension });
    tileSearch.search();

    const hit = tileSearch.foundProducts[0];
    model.hit = hit;
    model.search = tileSearch;

    request.custom.tileModel = model;
    return `
        <article data-include-url="${request.httpQueryString}" data-analytics='${model.analytics}' data-analytics-contribution='${model.analyticsContribution}'>
            <header>${model.regions.tileHeader.render()}</header>
            <body>
                ${model.regions.tileBody.render()}
            </body>
            <footer>${model.regions.tileFooter.render()}</footer>
        </article>`;
};
