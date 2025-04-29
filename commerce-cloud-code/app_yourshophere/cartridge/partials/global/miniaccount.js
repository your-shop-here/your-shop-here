/**
 * Generates HTML for the miniaccount component
 * @module miniaccount
 */

const SVG = require('*/cartridge/experience/utilities/svg.js');

/**
 * Creates a model for the miniaccount component
 * @param {Object} input - Input data for the model
 * @param {string} input.width - The width of the component
 * @param {Object} input.image - The image object containing file information
 * @param {string} input.label - The label text for the component
 * @returns {Object} Model object with miniaccount data
 */
exports.createModel = (input) => {
    const width = input.width || '100%';
    let imageHtml = '';

    if (input.image) {
        const iconInfo = SVG.getInlinableContent(input.image.file);
        if (iconInfo.type === 'IMG') {
            imageHtml = `<img src="${iconInfo.content}" style="width:${width}; margin-left:auto;"/>`;
        }
        if (iconInfo.type === 'SVG') {
            imageHtml = iconInfo.content;
            imageHtml = imageHtml.replace('<svg ', `<svg style="width:${width};" `);
        }
    }

    return {
        width,
        imageHtml,
        label: input.label || 'My Account',
        url: require('dw/web/URLUtils').url('Login-Show'),
    };
};

/**
 * Generates HTML template string for the miniaccount component
 * @param {Object} model - Model object containing miniaccount data
 * @param {string} model.imageHtml - HTML for the account icon
 * @param {string} model.label - Label text for the account link
 * @param {string} model.url - URL for the account link
 * @returns {string} HTML template string for the miniaccount component
 */
exports.template = (model) => `
    <a href="${model.url}" class="pill" role="button">
        ${model.imageHtml}
        ${model.label}
    </a>`;
