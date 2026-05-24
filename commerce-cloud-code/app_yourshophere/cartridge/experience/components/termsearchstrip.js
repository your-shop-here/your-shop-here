
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
    const searchterm = content.searchterm;
    const searchDetailsParam = content.searchdetails;
    const searchDetails = JSON.parse(searchDetailsParam.value);
    const searchModel = (new dw.catalog.ProductSearchModel());
    searchModel.setCategoryID('root');
    searchModel.setSearchPhrase(searchterm);

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
    let markup = '';
    for (let i = 0; i < 10; i++) {
        if (searchIterator.hasNext()) {
            const product = searchIterator.next().firstRepresentedProduct;
            const pModel = ProductViewModel.get(product);
            markup += new Template('experience/components/assets/productstriptile').render(pModel).text;
        }
    }
    model.markup = markup;

    return new Template('experience/components/assets/searchstrip').render(model).text;
}
