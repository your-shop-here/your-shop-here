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
        originalInstance: null, // For storing the instance being decorated
        html(params) {
            // If this is a decorated instance, handle the decoration
            if (this.originalInstance) {
                return this.renderDecoratedContent(params);
            }
            
            // Original partial rendering logic
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
                return 'error';
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
        renderDecoratedContent(params) {
            const Logger = require('*/api/Logger');
            let decoratedMarkup = '';

            try {
                // First, get the content from the original partial
                const originalContent = this.originalInstance.html(params);

                // Get the decorator partial
                // eslint-disable-next-line import/no-dynamic-require
                const decorator = require(`*/cartridge/partials/${this.id}`);

                // Create decorator model by merging original params with decorator-specific data
                let decoratorModel = {};
                if (decorator.createModel) {
                    // Use Object.assign instead of spread operator for Rhino compatibility
                    // Include decorator-specific model if it was set
                    const decoratorParams = Object.assign({}, params, {
                        content: originalContent, // Pass the rendered content to the decorator
                        originalParams: params    // Keep reference to original params
                    });
                    
                    // Add decorator-specific model if it exists
                    if (this.decoratorModel) {
                        decoratorParams.decoratorModel = this.decoratorModel;
                    }
                    
                    decoratorModel = decorator.createModel(decoratorParams);
                } else {
                    // Fallback: just pass the content if no createModel function
                    const fallbackParams = Object.assign({}, params, {
                        content: originalContent
                    });
                    
                    if (this.decoratorModel) {
                        fallbackParams.decoratorModel = this.decoratorModel;
                    }
                    
                    decoratorModel = fallbackParams;
                }

                // Render the decorator template
                if (decorator.template) {
                    decoratedMarkup = decorator.template(decoratorModel);
                } else {
                    Logger.error(`Decorator '${this.id}' is missing template function`);
                    return originalContent; // Fallback to original content
                }

            } catch (e) {
                Logger.error(`Decoration failed for '${this.id}': ${e.message} at '${e.fileName}:${e.lineNumber}'`);
                // Fallback: return original content if decoration fails
                return this.originalInstance.html(params);
            }

            return decoratedMarkup;
        },
        render(params) {
            response.getWriter().print(this.html(params));
            return this;
        },
        decorateWith(decoratorId) {
            // Create a new instance for the decorator
            const decoratedInstance = exports.create(decoratorId);
            // Store reference to the original instance being decorated
            decoratedInstance.originalInstance = this;
            return decoratedInstance;
        },
        
        /**
         * Optional: Sets decorator-specific model data
         * This provides a more explicit API for decorator models
         * @param {Object} decoratorModel - Model data specific to the decorator
         * @returns {Object} The renderer instance for chaining
         */
        withDecoratorModel(decoratorModel) {
            this.decoratorModel = decoratorModel;
            return this;
        },
    };
    return instance;
};
