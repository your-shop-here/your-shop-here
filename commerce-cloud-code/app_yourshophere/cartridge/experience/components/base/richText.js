'use strict';

var Template = require('dw/util/Template');
var HashMap = require('dw/util/HashMap');

/**
 * Render logic for the storefront.editorialRichText component
 * @param {dw.experience.ComponentScriptContext} context The Component script context object.
 * @returns {string} template to be displayed
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

    if (content.richText) {
        model.richText = content.richText;
        if (content.inParagraph === 'No') {
            model.richText = model.richText.replace('<p>','')
            model.richText = model.richText.replace(new RegExp('</p>$'),'')
        }
    }
    model.align = content.align || 'left';
    return new Template('experience/components/base/richtext').render(model).text;
};
