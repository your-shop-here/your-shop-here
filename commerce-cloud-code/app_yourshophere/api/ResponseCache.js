// allows the middleware known by express-style controllers to be used in Page-Designer
// or conditional such as with personalized search

const server = require('*/server');
const cache = require('*/cartridge/middleware/cache');

exports.apply = function applyCache(name) {
    // we hack a pseudo express js context here
    // @todo refactor so that the express style controllers and pd caches call the cache middle ware equally, so this becomes a bit more readable
    const applyCacheFn = server.applyCache;
    const res = { base: response };
    cache[`apply${name}`]({}, res, (() => applyCacheFn({}, res)));
};
