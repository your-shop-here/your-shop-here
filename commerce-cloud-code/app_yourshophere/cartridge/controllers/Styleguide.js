const server = require('*/server');

server.get('Show', (req, res, next) => {
    res.renderPartial('styleguide/styleguide', { object: {}, decorator: 'decorator/ssr' });
    next();
});

module.exports = server.exports();
