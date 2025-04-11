const partials = require('partials');

/**
 * Component which renders a search box - ideally used in the sfra page header
 * @param {dw.experience.PageScriptContext} context The page script context object.
 *
 * @returns {string} The template text
 */
exports.render = function render(context) {
    try {
        return partials.html('header/searchbox')({
            placeholderText: context.content.placeholderText,
            accesssibilityLabel: context.content.accesssibilityLabel,
        });
    } catch (e) {
        const Logger = require('api/Logger');
        Logger.error(`Exception on rendering page designer component: ${e.message} at '${e.fileName}:${e.lineNumber}'`);
    }

    return '';
};
