const Resource = require('dw/web/Resource');
const URLUtils = require('dw/web/URLUtils');

/**
 * Creates the model for the error page
 * @param {Object} options - The options for the model
 * @returns {Object} The model for the error page
 */
exports.createModel = (options) => {
    const error = options.error || {};
    const message = options.message || Resource.msg('subheading.error.general', 'translations', null);
    const showError = options.showError || false;
    const lang = options.lang || 'en';

    return {
        error,
        message,
        showError,
        lang,
        labels: {
            heading: Resource.msg('heading.error.general', 'translations', null),
            continueShopping: Resource.msg('button.continue.shopping', 'translations', null),
            inController: Resource.msg('error.in.controller', 'translations', null),
        },
    };
};

/**
 * Renders the error page
 * @param {Object} model - The model for the error page
 * @returns {string} The HTML for the error page
 */
exports.template = (model) => `
    <h1>${model.labels.heading}</h1>
    <div class="container">
        <h2>${model.message}</h2>
        ${model.showError ? `
            <pre><code>
                ${model.error.msg}
                ${model.error.controllerName ? `${model.labels.inController} ${model.error.controllerName}` : ''}
                ${model.error.startNodeName ? `-${model.error.startNodeName}` : ''}
            </code></pre>
        ` : ''}
        <a href="${URLUtils.url('Home-Show')}" class="btn btn-primary btn-block error continue-shopping" role="button" aria-pressed="true">
            ${model.labels.continueShopping}
        </a>
    </div>
`;
