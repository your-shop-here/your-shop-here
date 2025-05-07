const renderer = require('*/cartridge/partials/renderer');

/**
 * Component which renders miniaccount
 * @param {dw.experience.PageScriptContext} context The page script context object.
 * @returns {string} The template text
 */
exports.render = function render(context) {
    try {
        return renderer.html('global/miniaccount')(context.content);
    } catch (e) {
        const Logger = require('api/Logger');
        Logger.error(`Exception on rendering page designer component: ${e.message} at '${e.fileName}:${e.lineNumber}'`);
        return '';
    }
};

