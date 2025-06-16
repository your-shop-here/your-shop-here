'use strict';

/**
 * @namespace Home
 */
const server = require('*/server');
const cache = require('*/cartridge/middleware/cache');

server.get('Show', cache.applyPromotionSensitiveCache, server.middleware.include, (req, res, next) => {
    res.renderPartial('tile/tile');
    next();
});

module.exports = server.exports();