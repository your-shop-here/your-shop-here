/**
 * Renders a base image component
 *
 * @param {dw.experience.ComponentScriptContext} context The component context
 * @returns {string} The template to be displayed
 */
exports.render = function render(context) {
    return require('*/api/partials').create('base/image').html({
        image: context.content.image.file,
        width: context.content.width || '100%',
        link: context.content.link,
    });
};
