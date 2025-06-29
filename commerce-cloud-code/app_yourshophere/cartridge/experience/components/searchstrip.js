
const Template = require('dw/util/Template');
const HashMap = require('dw/util/HashMap');
const ProductViewModel = require('*/cartridge/experience/viewmodels/ProductViewModel');

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
    const model = new HashMap();
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
    const searchIterator = searchModel.productSearchHits;
    const products = [];
    const markup = '';
    for (let i = 0; i < 10; i++) {
        if (searchIterator.hasNext()) {
            const product = searchIterator.next().firstRepresentedProduct;
            products.push(product);
        }
    }
    model.markup = markup;

    return require('*/api/partials').create('content/searchstrip').html({
        products,
    });
}
