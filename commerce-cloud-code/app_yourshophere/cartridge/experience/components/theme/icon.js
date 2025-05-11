
const Template = require('dw/util/Template');
const HashMap = require('dw/util/HashMap');

/**
 * Render logic for the storefront.photoTile component.
 * @param {dw.experience.ComponentScriptContext} context The Component script context object.
 * @returns {string} The template to be displayed
 */
exports.render = function render(context) {
    try {
        return renderComponent(context);
    } catch (e) {
        const Logger = require('api/Logger');
        Logger.error(`Exception on rendering page designer component: ${e.message} at '${e.fileName}:${e.lineNumber}'`);
    }
};

function renderComponent(context) {
    const model = new HashMap();
    const content = context.content;

    model.image = content.image.file;
    // @todo pull width height from image meta data for jpgs etc
    model.width = content.width || '100%';
    model.height = content.height || '100%';

    model.link = content.link;
    return template(model);
}

function template(model) {
    return model.link
        ? `<a href="${model.link}"><img src="${model.image.URL}" style="width:${model.width}; height:${model.height}; margin-left:auto;"/></a>`
        : `<img src="${model.image.URL}" style="width:${model.width}; height:${model.height}; margin-left:auto;"/>
        </isif>`;
}
