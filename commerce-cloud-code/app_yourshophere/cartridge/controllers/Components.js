const server = require('*/server');
const cache = require('*/cartridge/middleware/cache');

/**
 * @name controller/Components-CategoryMenu
 */
server.get('CategoryMenu', cache.applyDefaultCache, (req, res, next) => {
    const CatalogMgr = require('dw/catalog/CatalogMgr');
    const rootCategory = CatalogMgr.getCategory('root');
    res.renderPartial('global/header/categorymenu', { object: rootCategory });
    return next();
});

/**
 * @name controller/Components-MiniCart
 */
server.get('MiniCart', server.middleware.include, (req, res, next) => {
    res.renderPartial('header/minicartinclude');
    return next();
});

/**
 * @name controller/Components-Miniwishlist
 */
server.get('MiniWishlist', server.middleware.include, (req, res, next) => {
    res.renderPartial('header/miniwishlistinclude');
    return next();
});

module.exports = server.exports();
