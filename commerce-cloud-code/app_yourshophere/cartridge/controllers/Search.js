/**
 * @namespace Search
 */
const server = require('*/server');

const cache = require('*/cartridge/middleware/cache');

/**
 * @name controller/Search-Show
 */
server.get('Show', cache.applyDefaultCache, (req, res, next) => {
    const PageMgr = require('dw/experience/PageMgr');
    const CatalogMgr = require('dw/catalog/CatalogMgr');
    const Logger = require('*/api/Logger');
    const HashMap = require('dw/util/HashMap');

    const categoryId = request.httpParameterMap.cgid.submitted ? request.httpParameterMap.cgid.stringValue : 'root';
    const category = CatalogMgr.getCategory(categoryId);
    if (!category) {
        const noCategoryError = `Category with ID ${categoryId} could not be found, rendering notfound page`;
        Logger.error(noCategoryError);
        res.render('pages/notfound', { reason: noCategoryError });
        return next();
    }

    const page = PageMgr.getPageByCategory(category, true, 'category');

    if (page && page.isVisible()) {
        const aspectAttributes = new HashMap();
        aspectAttributes.category = category;

        const HttpSearchParams = require('*/api/URLSearchParams');
        const searchParams = (new HttpSearchParams(request.httpParameterMap)).allowList(require('*/api/ProductSearchModel').constants.urlAllowListAll);
        searchParams.sort();
        const queryString = searchParams.toString();

        res.page(page.ID, JSON.stringify({ queryString }), aspectAttributes);
    } else {
        const error = `Page for category with ID ${categoryId} could not be found, rendering notfound page`;
        Logger.error(error);
        res.render('pages/notfound', { reason: error });
    }
    return next();
});

/**
 * @name controller/Search-Grid
 */
server.get('Grid', cache.applyInventorySensitiveCache, (req, res, next) => {
    res.renderPartial('plp/grid');
    return next();
});

/**
 * @name controller/Search-Refinements
 */
server.get('Refinements', cache.applyDefaultCache, (req, res, next) => {
    res.renderPartial('plp/refinements');
    return next();
});

/**
 * @name controller/Search-Suggestions
 */
server.get('Suggestions', cache.applyDefaultCache, (req, res, next) => {
    res.renderPartial('header/suggestions');
    return next();
});

module.exports = server.exports();
