
const Template = require('dw/util/Template');
const HashMap = require('dw/util/HashMap');
const SVG = require('*/cartridge/scripts/theming/svg.js');

/**
 * Component which renders a link to my account - ideally used in the main page header
 * @param {dw.experience.PageScriptContext} context The page script context object.
 *
 * @returns {string} The template text
 */
exports.render = function render(context) {
    try {
        return renderComponent(context);
    } catch (e) {
        const Logger = require('*/api/Logger');
        Logger.error(`Exception on rendering page designer component: ${e.message} at '${e.fileName}:${e.lineNumber}'`);
    }
};

function renderComponent(context) {
    const model = new HashMap();
    const content = context.content;
    model.content = content;
    if (content.icon) {
        const iconInfo = SVG.getInlinableContent(content.icon.file);
        model.type = iconInfo.type;
        model.content = iconInfo.content;
    }
    return new Template('experience/components/decorator/accounticon').render(model).text;
}
