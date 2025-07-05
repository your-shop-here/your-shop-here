/**
 * Renders Product Search Sorting Options Component
 *
 * @param {dw.experience.ComponentScriptContext} context The component context
 * @returns {string} The template to be displayed
 */
exports.render = function render(context) {
    try {
        const URLUtils = require('dw/web/URLUtils');
        const url = URLUtils.url('Search-SortingOptions');

        // Only use whitelisted parameters and sort them canonically to optimize caching
        const HttpSearchParams = require('*/api/URLSearchParams');
        const searchParams = (new HttpSearchParams(request.custom.model.httpParameter)).allowList(require('*/api/ProductSearchModel').constants.urlAllowListBase);
        searchParams.sort();
        dw.system.Logger.info(`searchParams line 16: ${searchParams}`);
        const queryString = searchParams.toString();
        dw.system.Logger.info(`queryString line 18: ${queryString}`);
        const urlString = `${url.toString()}?${queryString}`;

        return `<wainclude url="${urlString}">`;
    } catch (e) {
        const Logger = require('*/api/Logger');
        Logger.error(`Exception on rendering page designer component: ${e.message} at '${e.fileName}:${e.lineNumber}'`);
    }
    return '';
};
