/**
 * Component which renders minicart
 * @param {dw.experience.PageScriptContext} context The page script context object.
 *
 * @returns {string} The template text
 */
exports.render = function render(context) {
    return require('*/api/partials').create('theme/minicart').html({
        content: context.content,
    });
};
