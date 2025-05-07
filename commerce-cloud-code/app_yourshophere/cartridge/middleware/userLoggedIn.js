/**
 * Middleware validating if user logged in
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {Function} next - Next call in the middleware chain
 * @returns {void}
 */
function validateLoggedIn(req, res, next) {
    const URLUtils = require('dw/web/URLUtils');
    if (!customer.registered) {
        session.privacy.loginRedirectUrl = request.httpURL.toString();
        res.redirect(URLUtils.url('Login-Show'));
    }
    next();
}

module.exports = {
    validateLoggedIn,
};
