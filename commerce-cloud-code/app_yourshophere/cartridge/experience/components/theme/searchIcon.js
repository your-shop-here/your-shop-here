'use strict';

const partials = require('partials');

/**
 * Component which renders an icon with inline search - ideally used in the main page header
 * @param {dw.experience.PageScriptContext} context The page script context object.
 *
 * @returns {string} The rendered template to be displayed
 */
exports.render = function render(context) {
    try {
        return partials.html('header/searchicon')({
            icon: context.content.icon,
            color: context.content.color,
            brightness: context.content.brightness,
        });
    } catch (e) {
        const Logger = require('api/Logger');
        Logger.error(`Exception on rendering page designer component: ${e.message} at '${e.fileName}:${e.lineNumber}'`);
    }

    return '';
};
