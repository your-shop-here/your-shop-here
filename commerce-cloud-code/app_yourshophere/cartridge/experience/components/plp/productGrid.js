/**
 * Renders a Product Description Component
 *
 * @param {dw.experience.ComponentScriptContext} context The component context
 * @returns {string} The template to be displayed
 */
exports.render = function render(context) {
    try {
        const result = renderComponent(context);

        return result;
    } catch (e) {
        const Logger = require('*/api/Logger');
        Logger.error(`Exception on rendering page designer component: ${e.message} at '${e.fileName}:${e.lineNumber}'`);
    }
};

function renderComponent(context) {
    const model = createViewModel(context);
    return template(model);
}

function createViewModel(context) {
    const HashMap = require('dw/util/HashMap');
    let model = new HashMap();
    model = request.custom.model; // eslint-disable-line no-undef
    const URLUtils = require('dw/web/URLUtils');

    const HttpSearchParams = require('*/api/URLSearchParams');
    const searchParams = (new HttpSearchParams(request.custom.model.httpParameter)).allowList(require('*/api/ProductSearchModel').constants.urlAllowListAll);
    searchParams.sort();
    const queryString = searchParams.toString();

    const url = URLUtils.url('Search-Grid');
    url.append('component', context.component.ID);

    model.gridUrl = `${url.toString()}&${queryString}`;
    return model;
}

function template(model) {
    return `<wainclude url="${model.gridUrl}"/>`;
}
