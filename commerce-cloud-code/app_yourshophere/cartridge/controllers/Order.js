
const server = require('server');

server.get('Confirm', (req, res, next) => {
    res.page('order-thank-you', {});
    next();
});

module.exports = server.exports();
