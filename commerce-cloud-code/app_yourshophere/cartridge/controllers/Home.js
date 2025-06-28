/**
 * @namespace Home
 */

const server = require('*/server');
const cache = require('*/cartridge/middleware/cache');
const pageMetaData = require('*/cartridge/middleware/pageMetaData');

/**
 * Home-Show : This endpoint is called when a shopper navigates to the home page
 * @name controller/Home-Show

 */
server.get('Show', cache.applyDefaultCache, (req, res, next) => {
    const Site = require('dw/system/Site');
    const PageMgr = require('dw/experience/PageMgr');
    const Logger = require('*/api/Logger');
    pageMetaData.setPageMetaTags(req.pageMetaData, Site.current);

    const page = PageMgr.getPage('homepage');

    if (page && page.isVisible()) {
        pageMetaData.setPageMetaTags(req.pageMetaData, page);
        res.page('homepage');
    } else {
        Logger.error('Page with ID "homepage" not found')
        res.renderPartial('error/notfound', { object: { reason: 'page "homepage" not found' }, decorator: 'decorator/ssr' });
    }
    next();
}, pageMetaData.computedPageMetaData);

/**
 * This endpoint is called when a shopper navigates to a page that does not exist
 * @name controller/Home-ErrorNotFound
 */
server.get('ErrorNotFound', (req, res, next) => {
    res.setStatusCode(404);
    res.renderPartial('error/notfound', { object: { reason: '404' }, decorator: 'decorator/ssr' });
    next();
});

module.exports = server.exports();
