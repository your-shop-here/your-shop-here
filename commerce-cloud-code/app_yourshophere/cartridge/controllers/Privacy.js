const server = require('*/server');

server.post('CookieConsent', (req, res, next) => {
    const Cookie = require('dw/web/Cookie');
    const URLUtils = require('dw/web/URLUtils');
    const action = request.httpParameterMap.action.stringValue;
    const currentUrl = URLUtils.url('Home-Show').toString();

    if (action === 'accept') {
        // Set cookie consent accepted
        const consentCookie = new Cookie('ysh_dnt', '0');
        consentCookie.setPath('/');
        consentCookie.setMaxAge(365 * 24 * 60 * 60); // 1 year
        response.addHttpCookie(consentCookie);
        session.trackingAllowed = true;
    } else if (action === 'reject') {
        // Set cookie consent rejected (Do Not Track)
        const dntCookie = new Cookie('ysh_dnt', '1');
        dntCookie.setPath('/');
        dntCookie.setMaxAge(365 * 24 * 60 * 60); // 1 year
        response.addHttpCookie(dntCookie);
        session.trackingAllowed = false;
    }

    if (action) {
        if (request.httpHeaders['hx-request']) {
            res.print('');
        } else {
            // Redirect back to the original page or home
            res.redirect(currentUrl.toString());
        }
    } else {
        res.renderPartial('privacy/cookieConsent');
    }

    return next();
});

module.exports = server.exports();
