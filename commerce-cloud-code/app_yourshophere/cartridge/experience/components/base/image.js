'use strict';

var Template = require('dw/util/Template');
var HashMap = require('dw/util/HashMap');

/**
 * Render logic for the storefront.photoTile component.
 * @param {dw.experience.ComponentScriptContext} context The Component script context object.
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
    var model = new HashMap();
    var content = context.content;

    model.image = content.image.file;
    model.width = content.width || '100%';
    model.link = content.link;
    return new Template('experience/components/base/image').render(model).text;
};
