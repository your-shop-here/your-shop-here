
const Template = require('dw/util/Template');
const HashMap = require('dw/util/HashMap');
const SVG = require('*/cartridge/experience/utilities/svg.js');

/**
 * Component which renders minicart
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
    model.width = content.width || '100%';
    if (content.image) {
        const iconInfo = SVG.getInlinableContent(content.image.file);
        if (iconInfo.type === 'IMG') {
            model.imageHtml = `<img src="${iconInfo.content}" style="width:${model.width}; margin-left:auto;"/>`;
        }
        if (iconInfo.type === 'SVG') {
            model.imageHtml = `${iconInfo.content}`;
            model.imageHtml = model.imageHtml.replace('<svg ', `<svg style="width:${model.width};" `);
        }
    }

    return require('*/cartridge/partials/renderer').html('header/miniwishlist')(model);
}
