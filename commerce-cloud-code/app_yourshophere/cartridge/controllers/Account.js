const server = require('server');

/**
 * Show the account page
 * @TODO implement account page and loggedin middleware
 */
server.get('Show', server.middleware.https, (req, res, next) => {
    res.page('account');
    next();
});

module.exports = server.exports();
