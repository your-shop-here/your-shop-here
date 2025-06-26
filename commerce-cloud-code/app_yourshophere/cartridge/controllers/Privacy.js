const server = require('*/server');
const cache = require('*/cartridge/middleware/cache');

server.get('ShowCookieBanner', cache.applyDefaultCache, (req, res, next) => {
    res.renderPartial('privacy/cookieConsent');
    return next();
});

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

    if (request.httpHeaders['hx-request']) {
        res.print('');
    } else {
        // Redirect back to the original page or home
        res.redirect(currentUrl.toString());
    }

    return next();
});

module.exports = server.exports();
