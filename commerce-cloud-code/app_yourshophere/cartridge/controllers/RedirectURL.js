const server = require('server');

server.get('Start', (req, res, next) => {
    const URLRedirectMgr = require('dw/web/URLRedirectMgr');

    const redirect = URLRedirectMgr.redirect;
    const location = redirect ? redirect.location : null;
    const redirectStatus = redirect ? redirect.getStatus() : null;

    if (!location) {
        res.setStatusCode(404);
        res.render('pages/notfound', { httpParameter: {} });
    } else {
        if (redirectStatus) {
            res.setRedirectStatus(redirectStatus);
        }
        res.redirect(location);
    }

    next();
});

server.get('Hostname', (req, res, next) => {
    const URLUtils = require('dw/web/URLUtils');

    const url = req.querystring.Location.stringValue;
    const hostRegExp = new RegExp(`^https?://${req.httpHost}(?=/|$)`);
    let location;

    if (!url || !hostRegExp.test(url)) {
        location = URLUtils.httpHome().toString();
    } else {
        location = url;
    }

    res.redirect(location);
    next();
});

module.exports = server.exports();
