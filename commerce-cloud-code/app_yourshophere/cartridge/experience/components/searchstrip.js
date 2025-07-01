const HashMap = require('dw/util/HashMap');

// eslint-disable-next-line valid-jsdoc
/**
 * Render logic for the assets.categorytile.
 */
exports.render = function render(context) {
    try {
        return renderComponent(context);
    } catch (e) {
        const Logger = require('*/api/Logger');
        Logger.error(`Exception on rendering page designer component: ${e.message} at '${e.fileName}:${e.lineNumber}'`);
    }
};

function renderComponent(context) {
    const content = context.content;
    const category = content.category;
    const searchDetailsParam = content.searchdetails;
    const searchDetails = JSON.parse(searchDetailsParam.value);
    const searchModel = (new dw.catalog.ProductSearchModel());
    searchModel.setCategoryID(category ? category.ID : 'root');

    if (searchDetails.srule) {
        const sortingRules = dw.catalog.CatalogMgr.getSortingRules().toArray();
        const sortingRule = sortingRules.filter((apiSortingRule) => {
            if (searchDetails.srule === apiSortingRule.ID) {
                return true;
            }
            return false;
        }).pop();
        searchModel.setSortingRule(sortingRule);
    }

    if (searchDetails.filterattribute && searchDetails.filtervalue) {
        searchModel.addRefinementValues(searchDetails.filterattribute, searchDetails.filtervalue);
    }

    searchModel.search();
    const products = searchModel.productSearchHits.asList(0, content.productlimit).toArray()
        .map((productHit) => productHit.firstRepresentedProduct);

    return require('*/api/partials').create('content/searchstrip').html({
        products,
    });
}
