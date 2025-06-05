/**
 * Renders the given component to the response
 *
 * @param {string} id ID of the component (i.e. 'product/name')
 * @returns {function} The render function of the requested partial
 */
exports.render = (id) => ((params) => {
    response.getWriter().print(exports.html(id)(params));
    return '';
});

/**
 * Renders the given component and returns the markup
 *
 * @param {string} id ID of the component (i.e. 'product/name')
 * @returns {function} The render function of the requested partial
 */
exports.html = (id) => (
    (params) => {
        // eslint-disable-next-line import/no-dynamic-require
        const partial = require(`*/cartridge/partials/${id}`);
        let model;
        let markup = '';
        const Logger = require('api/Logger');

        try {
            model = partial.createModel(params);
        } catch (e) {
            Logger.error(`Model creation for partial '${id}' failed. Reason: ${e.message} at '${e.fileName}:${e.lineNumber}'
                ${request.httpPath}?${request.httpQueryString}    
            `);
        }

        try {
            markup = partial.template(model);
        } catch (e) {
            Logger.error(`
                Template rendering for partial '${id}' failed. Reason: ${e.message} at '${e.fileName}:${e.lineNumber}'
                    ${request.httpPath}?${request.httpQueryString} 
                `);
        }
        return markup;
    }
);
