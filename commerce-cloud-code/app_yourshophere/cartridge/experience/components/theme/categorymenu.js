
const HashMap = require('dw/util/HashMap');
const URLUtils = require('dw/web/URLUtils');

/**
 * Component which renders the classic SFRA menu
 * @param {dw.experience.PageScriptContext} context The page script context object.
 *
 * @returns {string} The template text
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
    const model = createViewModel(context);
    return template(model);
}

function createViewModel(context) {
    const model = new HashMap();
    const content = context.content;
    let align;
    if (content.align) {
        align = content.align;
    }
    let applyFilter = false;
    if (content.applyFilter) {
        applyFilter = content.applyFilter;
    } else {
        applyFilter = false;
    }

    model.menuUrl = URLUtils.url('Components-CategoryMenu', 'align', align, 'applyFilter', applyFilter);
    return model;
}

function template(model) {
    return `<wainclude url="${model.menuUrl}"/>`;
}
