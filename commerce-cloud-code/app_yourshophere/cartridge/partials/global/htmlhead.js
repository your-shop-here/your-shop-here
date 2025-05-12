
/**
 * Generates HTML head content for stylesheets
 * @module htmlhead
 */

/**
 * Creates a model containing stylesheet URLs
 * @returns {Object} Model object with array of stylesheet URLs
 * @property {Array} stylesheetUrls - Array of URLs for stylesheets to include
 */
exports.createModel = () => {
    const URLUtils = require('dw/web/URLUtils');
    return { stylesheetUrls: [
        URLUtils.staticURL('pico.min.css'),
        URLUtils.staticURL('header.css'),
        URLUtils.staticURL('experience/layouts.css'),
        URLUtils.staticURL('experience/components/base/moreImageAndText.css'),
        URLUtils.staticURL('progress.css'),
        URLUtils.staticURL('style.css'),
    ] };
};

/**
 * Generates HTML template string with stylesheet includes, for best performance the stylesheets are inlined into the head tag.
 * As the header of the page is usually not reloaded (only the docuemnt body), the stylesheets are not reloaded either.
 *
 * @param {Object} model - Model object containing stylesheet URLs
 * @param {Array} model.stylesheetUrls - Array of stylesheet URLs
 * @returns {string} HTML template string with stylesheet includes
 */
exports.template = (model) => `
    <style>
        ${model.stylesheetUrls.map((url) => `<wainclude url="${url}" />`).join('')}
    </style>`;
