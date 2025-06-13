
function hashmapToObject(hashMap) {
    return hashMap.keySet().toArray().reduce((accumulator, key) => {
        accumulator[key] = hashMap[key];
        return accumulator;
    }, {});
}

function storeComponentToFileSystemUrl(context) {
    const URLUtils = require('dw/web/URLUtils');
    const Site = require('dw/system/Site');
    const URLAction = require('dw/web/URLAction');
    const ContentMgr = require('dw/content/ContentMgr');

    const componentSettingsJson = JSON.stringify(hashmapToObject(context.content));

    const urlAction = new URLAction('PDUtils-Store', 'ReplaceMe');
    let url = URLUtils.url(urlAction);
    url.append('settings', componentSettingsJson);
    url.append('componentId', context.component.ID);
    url.append('siteId', Site.current.ID);
    url.append('libId', ContentMgr.getSiteLibrary().ID);
    url = url.toString().replace('-ReplaceMe-', '-');

    const cache = require('dw/system/CacheMgr').getCache('ComponentSettings');
    cache.put(context.component.ID, JSON.parse(componentSettingsJson));

    return url;
}

/**
 * Renders a Product Description Component
 *
 * @param {dw.experience.ComponentScriptContext} context The component context
 * @returns {string} The template to be displayed
 */
exports.render = function render(context) {
    try {
        const PageRenderHelper = require('*/cartridge/experience/utilities/PageRenderHelper.js');
        require('*/api/ResponseCache').apply('DefaultCache');
        let result = renderComponent(context);
        if (PageRenderHelper.isInEditMode()) {
            result = `<wainclude url="${storeComponentToFileSystemUrl(context)}"/>${result}`;
        }
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
