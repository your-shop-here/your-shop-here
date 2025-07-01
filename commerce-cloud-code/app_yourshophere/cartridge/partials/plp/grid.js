/**
 * Render search refinements
 *
 * @returns
 */
exports.createModel = () => {
    const HttpSearchParams = require('*/api/URLSearchParams');
    const model = {};
    const httpParams = new HttpSearchParams(request.httpParameterMap);
    const componentSettings = require('*/cartridge/utils/ComponentSettings').get(httpParams.get('component'));
    const search = require('*/api/ProductSearchModel').get(httpParams, { swatchAttribute: componentSettings.swatchDimension });
    search.search();

    const componentId = httpParams.get('component');
    model.products = search.foundProducts.map((hit) => ({ tileInclude: hit.tileInclude }));
    model.showMoreButton = (search.pagePosition + search.pageSize) < search.resultCount;
    // @todo makes only sense with proper page controls
    model.moreUrlFull = search.nextPageUrl('Search-Show').toString();
    model.moreUrlHx = search.nextPageUrl('Search-Grid');
    model.moreUrlHx = model.moreUrlHx.append('component', componentId);
    model.desktopColumns = componentSettings.desktopColumns || 3;
    model.mobileColumns = componentSettings.mobileColumns || 2;
    const analyticsData = {
        // the products array will be filled in tile.js, so we leverage the caching of the tiles
        products: [],
        sortingRule: [{
            attribute: (search.getEffectiveSortingRule() && search.getEffectiveSortingRule().ID) || 'best-matches',
            direction: 'ascending',
        }],
        itemRange: {
            start: search.pagePosition,
        },
    };
    if (search.isCategorySearch()) {
        analyticsData.type = 'viewCategory';
        analyticsData.category = search.getCategoryID();
    } else {
        analyticsData.type = 'viewSearch';
        analyticsData.searchText = search.getSearchPhrase();
    }
    model.analytics = JSON.stringify(analyticsData);
    return model;
};

exports.template = (model) => `
    <div class="grid product-grid desktop-cols-${model.desktopColumns} mobile-cols-${model.mobileColumns}" data-analytics='${model.analytics}'>
        ${model.products.map((hit) => templateIncludeHit(hit, model.componentId)).join('')}
    </div>
    ${model.showMoreButton ? templateIncludeMore(model) : ''}
`;

function templateIncludeHit(hit) {
    return `${hit.tileInclude}`;
}

function templateIncludeMore(model) {
    return `<div id="search-more">
        <a role="button" href="${model.moreUrlFull}"  hx-get="${model.moreUrlHx}" hx-target="#search-more" hx-swap="outerHTML">
            <!-- // @todo localization -->
            More
        </a>
    </div>`;
}
