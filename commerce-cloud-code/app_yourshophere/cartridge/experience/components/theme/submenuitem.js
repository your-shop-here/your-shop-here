'use strict';

var Template = require('dw/util/Template');
var HashMap = require('dw/util/HashMap');
var PageRenderHelper = require('*/cartridge/experience/utilities/PageRenderHelper.js');

/**
 * Render logic for manually place menu item
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
    var component = context.component;

    var model = new HashMap();
    model.regions = PageRenderHelper.getRegionModelRegistry(component);
    model.content = content;
    return new Template('experience/components/decorator/submenuitem').render(model).text;
};
