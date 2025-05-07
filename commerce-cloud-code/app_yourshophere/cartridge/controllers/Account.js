const server = require('server');
const userLoggedIn = require('*/cartridge/middleware/userLoggedIn');
/**
 * Show the account page
 * @TODO implement account page and loggedin middleware
 */
server.get('Show', server.middleware.https, userLoggedIn.validateLoggedIn, (req, res, next) => {
    res.page('account');
    next();
});

module.exports = server.exports();
