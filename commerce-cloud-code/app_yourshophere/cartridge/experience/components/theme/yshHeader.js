'use strict';

var Template = require('dw/util/Template');
var HashMap = require('dw/util/HashMap');
var PageRenderHelper = require('*/cartridge/experience/utilities/PageRenderHelper.js');

/**
 * Render logic for the SFRA style storefront Header
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
    var component = context.component;

    model.regions = PageRenderHelper.getRegionModelRegistry(component);
    return new Template('experience/components/decorator/yshHeader').render(model).text;
};
