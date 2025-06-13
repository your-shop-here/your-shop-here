/* eslint-disable no-undef */
'use strict';

var Template = require('dw/util/Template');
var HashMap = require('dw/util/HashMap');
var CatalogMgr = require('dw/catalog/CatalogMgr');
var Logger = require('*/api/Logger');
var CategoryRenderHelper = require('*/cartridge/experience/utilities/CategoryRenderHelper.js');
var imageContainerDecorator = require('*/cartridge/experience/utilities/decorator/imageContainer.js');


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
    var cgid = CategoryRenderHelper.getCategoryFromPageId(request.httpParameterMap);
    if (!cgid) {
        Logger.error('Cgid not found ' + cgid);
        return null;
    }
    var tmpModel = Object.create(null);
    var category = CatalogMgr.getCategory(cgid);
    imageContainerDecorator(tmpModel, content);
    model = tmpModel.imageContainer;
    model.heading = (content.heading) ? content.heading.replace('$CAT_DISPLAY_NAME', category.getDisplayName()) : null;
    return new Template('experience/components/more_pd/categoryBanner').render(model).text;
};
