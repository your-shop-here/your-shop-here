/**
 * Renders a Product Main Component
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

    var contentOnlyNoCommerce = context.content.contentOnlyNoCommerce;
    // further model manipulation linked to the content only case could be added here

    model.display = {
        showBreadcrumbs: context.content.showBreadcrumbs,
        contentOnlyNoCommerce: contentOnlyNoCommerce
    };

    return new Template('experience/components/pdp/productallinone').render(model).text;
};
