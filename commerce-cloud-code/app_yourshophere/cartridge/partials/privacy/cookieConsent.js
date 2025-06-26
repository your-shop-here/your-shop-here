const URLUtils = require('dw/web/URLUtils');

/**
 * Creates the model for the cookie consent partial
 * @param {Object} options The component settings
 * @returns {Object} The model for the partial
 */
exports.createModel = function createModel(options) {
    const model = {
        bannerText: options.bannerText || 'We use cookies to enhance your experience. By continuing to visit this site you agree to our use of cookies.',
        acceptButtonText: options.acceptButtonText || 'Accept',
        rejectButtonText: options.rejectButtonText || 'Decline',
        bannerPosition: options.bannerPosition || 'top',
        bannerStyle: options.bannerStyle || 'warning',
        hasCookieConsent: false,
        formURL: URLUtils.url('Privacy-CookieConsent').toString(),
        essentialJs: URLUtils.staticURL('js/privacy.js'),
    };

    // Check if the ysl_dnt cookie exists
    // const dntCookie = request.httpCookies.ysh_dnt;
    model.renderCookieConsentText = request.httpHeaders['hx-request'];// dntCookie !== undefined;

    return model;
};

/**
 * Renders the cookie consent partial, the partial assumes the existence of a an element with the class .announcement
 *
 * @param {Object} model - The model for the partial
 * @returns {string} The HTML for the partial
 */
exports.template = (model) => (model.renderCookieConsentText ? `
    <div id="cookie-consent-banner" class="cookie-consent-banner ${model.bannerPosition} ${model.bannerStyle}" data-cookie-consent="true">
        <div class="cookie-consent-content">
            <div class="cookie-consent-text">
                ${model.bannerText}
            </div>
            <form class="cookie-consent-actions" hx-post="${model.formURL}"
                    hx-target="#cookie-consent-banner"
                    hx-swap="outerHTML"
                    hx-indicator=".progress">
                <button type="submit" name="action" value="accept" class="btn btn-primary cookie-consent-accept">
                    ${model.acceptButtonText}
                </button>
                <button type="submit" name="action" value="reject" class="btn btn-secondary cookie-consent-reject">
                    ${model.rejectButtonText}
                </a>
            </form>
        </div>
    </div>
` : `<div id="cookie-consent-check" hx-post="${model.formURL}" 
        hx-target=".announcement"
        hx-swap="outerHTML"
        hx-indicator=".progress"
        hx-trigger="cookie-consent-check from:body"></div>
    <script src="${model.essentialJs}" defer></script>`);
