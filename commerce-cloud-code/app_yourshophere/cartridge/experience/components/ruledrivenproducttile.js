'use strict';

var Template = require('dw/util/Template');
var HashMap = require('dw/util/HashMap');
var URLUtils = require('dw/web/URLUtils');
var CatalogMgr = require('dw/catalog/CatalogMgr');
var ProductSearchModel = require('dw/catalog/ProductSearchModel');
var ProductViewModel = require('*/cartridge/experience/viewmodels/ProductViewModel');

/**
 * Render logic for rule driven product tile.
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

    var sortingRuleID = content.sorting_rule;
    var sortingRule = sortingRuleID ? CatalogMgr.getSortingRule(sortingRuleID) : null;

    model.url = URLUtils.url('Home-Show');

    if (sortingRule) {
        var searchModel = new ProductSearchModel();
        searchModel.setCategoryID('root');
        if (content.category) {
            searchModel.setCategoryID(content.category.ID);
        }
        searchModel.setSortingRule(sortingRule);
        searchModel.search();
        var hits = searchModel.getProductSearchHits();
        var product = hits ? searchModel.getProductSearchHits().next().product : null;
        if (product) {
            model = ProductViewModel.get(product);

            // overload with explicite configs
            if (content.shop_now_target) {
                model.url = content.shop_now_target;
            }
            if (content.text_headline) {
                model.text_headline = content.text_headline;
            }
        }
    }

    model.text_headline = content.text_headline;

    return new Template('experience/components/assets/producttile').render(model).text;
};
