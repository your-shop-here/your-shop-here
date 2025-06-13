'use strict';
var CatalogMgr = require('dw/catalog/CatalogMgr');
var server = require('*/server');

var cache = require('*/cartridge/middleware/cache');

server.get('Last', cache.applyDefaultCache, (req, res, next) => {
    const logCache = require('dw/system/CacheMgr').getCache('LogCache');
    const entries = logCache.get('entry');
    res.json({entries: entries});
    next();
});

module.exports = server.exports();
