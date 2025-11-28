/**
 * Creates a model for the base richText component
 *
 * @param {Object} options - The options object
 * @param {Object} options.content - The component content
 * @returns {Object} The model object
 */
exports.createModel = function createModel(options) {
    const content = options.content;
    let html = '';

    if (content.richText) {
        html = content.richText;
        if (content.inParagraph === 'No') {
            html = html.replace('<p>', '');
            html = html.replace(/<\/p>$/, '');
        } else {
            html = html.replace(/<p>/g, `<p style="text-align: ${content.align || 'left'};">`);
        }
    }

    const model = {
        html,
    };
    return model;
};

/**
 * Renders the base richText component
 *
 * @param {Object} model - The model object
 * @returns {string} The rendered HTML
 */
exports.template = (model) => model.html;
