/**
 * The Default controller doesn't use server.js (express, sfra-style)
 * because it does not show up in the internal url
 * So it would require special handling there to catch it in a performant way
 */

const partials = require('*/api/partials');

/**
 * Redirects to the home page, default route when no controller is specified in the URL
 * @param {Object} args - The arguments passed to the controller
 * @returns {void}
 */
exports.Start = (args) => {
    const URLUtils = require('dw/web/URLUtils');
    const cacheTime = new Date();
    cacheTime.setHours(cacheTime.getHours() + 24);
    response.setExpires(cacheTime);
    response.redirect(URLUtils.url('Home-Show'));
};
exports.Start.public = true;

/**
 * Displays the site offline page
 * @returns {void}
 */
exports.Offline = () => {
    const cacheTime = new Date();
    cacheTime.setHours(cacheTime.getHours() + 24);
    response.setExpires(cacheTime);
    response.setStatus(503);
    partials.render('error/siteoffline')({
        lang: require('dw/util/Locale').getLocale(request.getLocale()).getLanguage(),
    });
};
exports.Offline.public = true;
