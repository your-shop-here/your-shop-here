/**
 * Renders a Cookie Consent Component
 *
 * @param {dw.experience.ComponentScriptContext} context The component context
 * @returns {string} The template to be displayed
 */
exports.render = function render(context) {
    const PageRenderHelper = require('*/cartridge/experience/utilities/PageRenderHelper.js');
    return PageRenderHelper.isInEditMode() ? 'Cookie Consent' : require('*/api/partials').create('privacy/cookieConsent').html(context.content);
};
