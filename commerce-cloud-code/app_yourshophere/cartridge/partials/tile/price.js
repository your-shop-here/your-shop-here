function getListPrices(httpParams) {
    const CacheMgr = require('dw/system/CacheMgr');
    const PriceBookMgr = require('dw/catalog/PriceBookMgr');
    const listPriceBookCache = CacheMgr.getCache('UsedPriceBooks');
    const priceBookIds = listPriceBookCache.get(request.locale, () => {
        const applicablePriceBooks = PriceBookMgr.applicablePriceBooks;
        const currentActivePriceBooks = !applicablePriceBooks.empty ? applicablePriceBooks : PriceBookMgr.sitePriceBooks;
        const listPricebookIds = currentActivePriceBooks.toArray().filter((priceBook) => !priceBook.parentPriceBook).map((priceBook) => priceBook.ID);
        const applicablePricebookIds = applicablePriceBooks.toArray().map((priceBook) => priceBook.ID);

        return { list: listPricebookIds, applicable: applicablePricebookIds };
    });

    let listPriceMin;
    let listPriceMax;

    try {
        PriceBookMgr.setApplicablePriceBooks(priceBookIds.list.map((id) => PriceBookMgr.getPriceBook(id)));
        const listPriceSearch = require('*/api/ProductSearchModel').get(httpParams);
        listPriceSearch.search();
        listPriceMin = listPriceSearch.minPrice;
        listPriceMax = listPriceSearch.maxPrice;
    } catch (e) {
        const Logger = require('*/api/Logger');
        Logger.error(`Issue on list pricebook search ${e}`);
    } finally {
        if (priceBookIds.applicable.length > 0) {
            PriceBookMgr.setApplicablePriceBooks();
        } else {
            PriceBookMgr.setApplicablePriceBooks(priceBookIds.applicable.map((id) => PriceBookMgr.getPriceBook(id)));
        }
    }
    return { min: listPriceMin, max: listPriceMax };
}

/**
 * Create view model for a product price
 *
 * @todo Add proper price calculation and strike price
 * @param {Object} options - The options object
 * @param {Object} options.hit - The search hit containing product information
 * @param {Object} options.tileSearch - The tile search model
 * @param {Object} options.httpParams - HTTP parameters for price calculation
 * @returns the view model
 */
exports.createModel = (options) => {
    const StringUtils = require('dw/util/StringUtils');
    const { tileSearch, httpParams } = options;

    const listPrices = getListPrices(httpParams);
    const listPriceMax = listPrices.max;
    const listPriceMin = listPrices.min;
    const listPrice = listPriceMax;
    const rangeListPrice = listPriceMin !== listPriceMax;

    const salePriceMin = tileSearch.minPrice;
    const salePrice = salePriceMin;
    const showStrike = salePrice !== listPrice;

    return {
        salesPrice: StringUtils.formatMoney(new dw.value.Money(salePrice, session.currency.currencyCode)),
        listPrice: StringUtils.formatMoney(new dw.value.Money(listPrice, session.currency.currencyCode)),
        listPriceMarker: rangeListPrice ? 'max. ' : '',
        salePriceMarker: rangeListPrice ? 'from ' : '',
        showStrike,
    };
};

exports.template = function (model) {
    const listPrice = model.showStrike ? `<div class="strike">${model.listPriceMarker}${model.listPrice}</div>` : '';
    const salePrice = `<div class="price">${model.salePriceMarker}${model.salesPrice}</div>`;
    return listPrice + salePrice;
};
