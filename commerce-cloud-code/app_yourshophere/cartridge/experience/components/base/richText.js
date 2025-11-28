/**
 * Renders a base richText component
 *
 * @param {dw.experience.ComponentScriptContext} context The component context
 * @returns {string} The template to be displayed
 */
exports.render = function render(context) {
    return require('*/api/partials').create('base/richText').html({
        content: context.content,
    });
};
