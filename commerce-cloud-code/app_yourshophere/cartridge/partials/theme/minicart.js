/**
 * Creates a model for the minicart component
 *
 * @param {Object} options - The options object
 * @param {Object} options.content - The component content
 * @returns {Object} The model object
 */
exports.createModel = function createModel(options) {
    const URLUtils = require('dw/web/URLUtils');
    const SVG = require('*/cartridge/experience/utilities/svg.js');

    const content = options.content;
    const width = content.width || '100%';
    let imageHtml = '';

    if (content.image) {
        const iconInfo = SVG.getInlinableContent(content.image.file);
        if (iconInfo.type === 'IMG') {
            imageHtml = `<img src="${iconInfo.content}" style="width:${width}; margin-left:auto;"/>`;
        }
        if (iconInfo.type === 'SVG') {
            imageHtml = `${iconInfo.content}`;
            imageHtml = imageHtml.replace('<svg ', `<svg style="width:${width};" `);
        }
    }

    const model = {
        cartUrl: URLUtils.url('Cart-Show'),
        miniCartUrl: URLUtils.url('Components-MiniCart'),
        imageHtml,
    };
    return model;
};

/**
 * Renders the minicart component
 *
 * @param {Object} model - The model object
 * @returns {string} The rendered HTML
 */
exports.template = (model) => `<a href="${model.cartUrl}" class="header-link">
    ${model.imageHtml}
    <wainclude url="${model.miniCartUrl}">
</a>`;
