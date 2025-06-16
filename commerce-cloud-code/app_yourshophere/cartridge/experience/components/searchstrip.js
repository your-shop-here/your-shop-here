'use strict';

var Template = require('dw/util/Template');
var HashMap = require('dw/util/HashMap');
var ProductViewModel = require('*/cartridge/experience/viewmodels/ProductViewModel');

// eslint-disable-next-line valid-jsdoc
/**
 * Render logic for the assets.categorytile.
 */
exports.render = function render (context) {
    try {
        return renderComponent (context)
    } catch (e) {
        const Logger = require('*/api/Logger');
        Logger.error(`Exception on rendering page designer component: ${e.message} at '${e.fileName}:${e.lineNumber}'`)
    }
}

function renderComponent (context) {
    var model = new HashMap();
    var content = context.content;
    var category = content.category;
    var searchDetailsParam = content.searchdetails;
    var searchDetails = JSON.parse(searchDetailsParam.value);
    var searchModel = (new dw.catalog.ProductSearchModel());
    searchModel.setCategoryID(category ? category.ID : 'root');

    if (searchDetails.srule) {
        var sortingRules = dw.catalog.CatalogMgr.getSortingRules().toArray();
        var sortingRule = sortingRules.filter(function (apiSortingRule) {
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
    var searchIterator = searchModel.productSearchHits;
    var markup = '';
    for (var i = 0; i < 10; i++) {
        if (searchIterator.hasNext()) {
            let product = searchIterator.next().firstRepresentedProduct;
            let pModel = ProductViewModel.get(product);
            markup += new Template('experience/components/assets/productstriptile').render(pModel).text;
        }
    }
    model.markup = markup;

    return new Template('experience/components/assets/searchstrip').render(model).text;
};
