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
                    body {
                        font-family: Arial, sans-serif;
                        margin: 0;
                        padding: 20px;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        min-height: 100vh;
                        background-color: #f5f5f5;
                    }
                    .error-container {
                        text-align: center;
                        padding: 40px;
                        background-color: white;
                        border-radius: 8px;
                        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                        max-width: 600px;
                        width: 100%;
                    }
                    h1 {
                        color: #333;
                        margin-bottom: 20px;
                    }
                    p {
                        color: #666;
                        line-height: 1.6;
                        margin-bottom: 20px;
                    }
                    .thankyou {
                        color: #888;
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
