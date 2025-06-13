/**
 * Renders a Product Attribute. Component
 *
 * @param {dw.experience.ComponentScriptContext} context The component context
 * @returns {string} The template to be displayed
 */
exports.render = function render(context) {
    try {
        return renderComponent(context)
    } catch (e) {
        const Logger = require('*/api/Logger');
        Logger.error(`Exception on rendering page designer component: ${e.message} at '${e.fileName}:${e.lineNumber}'`)
    }
}

function renderComponent(context) {
    var Template = require('dw/util/Template');
    var HashMap = require('dw/util/HashMap');
    var model = new HashMap();

    model = request.custom.model; // eslint-disable-line no-undef

    model.display = {
        attributeTitle: context.content.attributeTitle,
        attributeID: context.content.attributeID,
        divExpandedOrCompress: context.content.divExpandedOrCompress
    };

    return new Template('experience/components/pdp/productAttribute').render(model).text;
};
