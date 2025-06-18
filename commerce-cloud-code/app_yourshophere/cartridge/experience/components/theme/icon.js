const renderer = require('*/api/partials');

/**
 * Component which renders an icon
 * @param {dw.experience.PageScriptContext} context The page script context object.
 *
 * @returns {string} The template text
 */
exports.render = function render(context) {
    try {
        return renderer.create('header/icon').html({
            image: context.content.image.file,
            width: context.content.width || '100%',
            height: context.content.height || '100%',
            link: context.content.link,
        });
    } catch (e) {
        const Logger = require('*/api/Logger');
        Logger.error(`Exception on rendering page designer component: ${e.message} at '${e.fileName}:${e.lineNumber}'`);
        return '';
    }
};
