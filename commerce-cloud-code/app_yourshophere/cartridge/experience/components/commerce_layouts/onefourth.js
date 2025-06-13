
'use strict';

var Template = require('dw/util/Template');
var HashMap = require('dw/util/HashMap');
var PageRenderHelper = require('*/cartridge/experience/utilities/PageRenderHelper.js');

/**
 * Render logic for the storefront.1 Row x 1 Col (Mobile) 1 Row x 1 Col (Desktop) layout
 * @param {dw.experience.ComponentScriptContext} context The Component script context object.
 * @param {dw.util.Map} [modelIn] Additional model values created by another cartridge. This will not be passed in by Commcerce Cloud Plattform.
 *
 * @returns {string} The markup to be displayed
 */
exports.render = function render (context, modelIn) {
    try {
        return renderComponent (context, modelIn)
    } catch (e) {
        const Logger = require('*/api/Logger');
        Logger.error(`Exception on rendering page designer component: ${e.message} at '${e.fileName}:${e.lineNumber}'`)
    }
}

function renderComponent (context, modelIn) {
    var model = modelIn || new HashMap();
    var component = context.component;
    var content = context.content;

    model.regions = PageRenderHelper.getRegionModelRegistry(component);
    model.addStyleClassName = context.content.addStyleClassName;

    return new Template('experience/components/commerce_layouts/onefourth').render(model).text;
};
