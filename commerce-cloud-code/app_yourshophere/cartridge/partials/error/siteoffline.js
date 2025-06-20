const Resource = require('dw/web/Resource');

/**
 * Creates the model for the site offline error page
 * @param {Object} params - The parameters for the model
 * @returns {Object} The model for the site offline error page
 */
function createModel(params) {
    const model = {
        header: Resource.msg('siteoffline.header', 'translations', null),
        message: Resource.msg('siteoffline.message', 'translations', null),
        thankyou: Resource.msg('siteoffline.thankyou', 'translations', null),
        lang: params.lang || 'en',
    };
    return model;
}

/**
 * Renders the site offline error page
 * @param {Object} model - The model for the site offline error page
 * @returns {string} The HTML for the site offline error page
 */
function template(model) {
    return `
        <!DOCTYPE html>
        <html lang="${model.lang}">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>${model.header}</title>
                <style>
                    :root {
                        --ysh-error: #ea4335;
                        --ysh-bg-primary: #ffffff;
                        --ysh-border-color: #dadce0;
                        --ysh-text-secondary: #5f6368;
                        --ysh-text-muted: #80868b;
                        --ysh-spacing-lg: 2rem;
                        --ysh-spacing-md: 1rem;
                        --ysh-border-radius-md: 8px;
                        --ysh-shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
                        --ysh-line-height: 1.5;
                    }
                    
                    body {
                        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
                        margin: 0;
                        padding: 20px;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        min-height: 100vh;
                        background-color: #f5f5f5;
                    }
                    
                    .error-container {
                        background-color: var(--ysh-bg-primary);
                        border: 1px solid var(--ysh-border-color);
                        border-radius: var(--ysh-border-radius-md);
                        padding: var(--ysh-spacing-lg);
                        margin: var(--ysh-spacing-lg) auto;
                        max-width: 600px;
                        text-align: center;
                        box-shadow: var(--ysh-shadow-sm);
                    }
                    
                    .error-container h1 {
                        color: var(--ysh-error);
                        margin-bottom: var(--ysh-spacing-md);
                    }
                    
                    .error-container p {
                        color: var(--ysh-text-secondary);
                        line-height: var(--ysh-line-height);
                        margin-bottom: var(--ysh-spacing-md);
                    }
                    
                    .error-container .thankyou {
                        color: var(--ysh-text-muted);
                        font-style: italic;
                    }
                </style>
            </head>
            <body>
                <div class="error-container">
                    <h1>${model.header}</h1>
                    <p>${model.message}</p>
                    <p class="thankyou">${model.thankyou}</p>
                </div>
            </body>
        </html>
    `;
}

module.exports = {
    createModel,
    template,
};
