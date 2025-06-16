'use strict';

var Template = require('dw/util/Template');

/**
 * Render logic for storefront.carousel layout.
 * @param {dw.experience.ComponentScriptContext} context The component script context object.
 * @returns {string} The template to be displayed
 */
exports.render = function render (context) {
    try {
        return renderComponent (context)
    } catch (e) {
        const Logger = require('*/api/Logger');
        Logger.error(`Exception on rendering page designer component: ${e.message} at '${e.fileName}:${e.lineNumber}'`)
    }
}

function renderComponent (context) {
    var content = context.content;
    return new Template('experience/components/more_pd/divider').render(content).text;
};
