/**
 * Renders a Welcome Back Component
 *
 * @param {dw.experience.ComponentScriptContext} context The component context
 * @returns {string} The template to be displayed
 */
exports.render = function render(context) {
    return require('*/api/partials').create('account/welcomeBack').html({
        customer,
        settings: context.content,
    });
};
