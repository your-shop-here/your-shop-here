/**
 * Renders the given component to the response
 *
 * @param {string} id ID of the component (i.e. 'product/name')
 * @returns {function} The render function of the requested partial
 */
exports.render = (id) => ((params) => {
    response.getWriter().print(exports.create(id).html(params));
    return '';
});

/**
 * Creates a new partial renderer instance
 *
 * @param {string} id ID of the component (i.e. 'product/name')
 * @returns {Object} The renderer instance
 */
exports.create = (id) => {
    const instance = {
        id,
        html(params) {
            // eslint-disable-next-line import/no-dynamic-require
            const partial = require(`*/cartridge/partials/${this.id}`);
            let model;
            let markup = '';
            const Logger = require('*/api/Logger');

            try {
                model = partial.createModel(params);
            } catch (e) {
                Logger.error(`Model creation for partial '${this.id}' failed. Reason: ${e.message} at '${e.fileName}:${e.lineNumber}'
                    ${request.httpPath}?${request.httpQueryString}    
                `);
            }

            try {
                markup = partial.template(model);
            } catch (e) {
                Logger.error(`
                    Template rendering for partial '${this.id}' failed. Reason: ${e.message} at '${e.fileName}:${e.lineNumber}'
                        ${request.httpPath}?${request.httpQueryString} 
                    `);
            }
            return markup;
        },
        render(params) {
            response.getWriter().print(this.html(params));
            return this;
        },
        decorateWith(nextId) {
            return exports.create(nextId);
        },
    };
    return instance;
};
