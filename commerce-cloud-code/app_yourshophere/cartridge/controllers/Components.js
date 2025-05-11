
const server = require('server');
const cache = require('*/cartridge/middleware/cache');

server.get('CategoryMenu', cache.applyDefaultCache, (req, res, next) => {
    const rootCategory = dw.catalog.CatalogMgr.getCategory('root');
    res.renderPartial('global/header/categorymenu', { object: rootCategory });
    next();
});

server.get('MiniCart', server.middleware.include, (req, res, next) => {
    const StringUtils = require('dw/util/StringUtils');

    res.render('/components/header/minicartinclude', {
        cartInfo: {
            itemCount: StringUtils.formatNumber(session.privacy.cartItemCount || 0, '0.#'),
            itemValue: session.privacy.cartItemValue || 0,
        },
    });
    next();
});

module.exports = server.exports();
