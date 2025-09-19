
const server = require('*/server');
const userLoggedIn = require('*/cartridge/middleware/userLoggedIn');

server.get('Confirm', (req, res, next) => {
    res.page('order-thank-you', {});
    next();
});

/**
 * Show the order history page
 */
server.get('History', server.middleware.https, userLoggedIn.validateLoggedIn, (req, res, next) => {
    res.page('orderhistory');
    next();
});

/**
 * Show the order details page
 */
server.get('Details', server.middleware.https, userLoggedIn.validateLoggedIn, (req, res, next) => {
    res.page('orderdetails', { object: { orderNo: request.httpParameterMap.orderNo.stringValue } });
    next();
});

module.exports = server.exports();
