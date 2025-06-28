/**
 * @namespace Page
 */

const server = require('*/server');
const cache = require('*/cartridge/middleware/cache');
const pageMetaData = require('*/cartridge/middleware/pageMetaData');

/**
 * Page-Show : This endpoint is called when a shopper navigates to a page designer page
 * @name controller/Page-Show
 */
server.get('Show', cache.applyDefaultCache, (req, res, next) => {
    const Site = require('dw/system/Site');
    const PageMgr = require('dw/experience/PageMgr');
    const Logger = require('*/api/Logger');
    pageMetaData.setPageMetaTags(req.pageMetaData, Site.current);

    const pageId = request.httpParameterMap.cid.stringValue;

    if (!pageId) {
        Logger.error('No page ID provided in cid parameter');
        res.renderPartial('error/notfound', { object: { reason: 'No page ID provided' }, decorator: 'decorator/ssr' });
        return next();
    }

    const page = PageMgr.getPage(pageId);

    if (page && page.isVisible()) {
        pageMetaData.setPageMetaTags(req.pageMetaData, page);
        res.page(pageId);
    } else {
        Logger.error('Page with ID "{0}" not found', pageId);
        res.renderPartial('error/notfound', { object: { reason: `page "${pageId}" not found` }, decorator: 'decorator/ssr' });
    }
    return next();
}, pageMetaData.computedPageMetaData);

module.exports = server.exports();
