
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
    return {
        title: request.pageMetaData.title || dw.system.Site.current.name,
        description: request.pageMetaData.description,
        keywords: request.pageMetaData.keywords,
        pageMetaTags: request.pageMetaData.pageMetaTags.map((item) => ({
            ID: item.ID,
            content: item.content,
            name: item.name,
            property: item.property,
        })),
        manifestUrl: URLUtils.staticURL('manifest.json'),
        stylesheetUrls: [
            URLUtils.staticURL('pico.min.css'),
            URLUtils.staticURL('style.css'),
            URLUtils.staticURL('header.css'),
            URLUtils.staticURL('experience/layouts.css'),
            URLUtils.staticURL('experience/components/base/moreImageAndText.css'),
            URLUtils.staticURL('progress.css')],
    };
};

/**
 * Generates HTML template string with stylesheet includes, for best performance the stylesheets are inlined into the head tag.
 * As the header of the page is usually not reloaded (only the docuemnt body), the stylesheets are not reloaded either.
 *
 * @param {Object} model - Model object containing stylesheet URLs
 * @param {Array} model.stylesheetUrls - Array of stylesheet URLs
 * @returns {string} HTML template string with stylesheet includes
 */
exports.template = (model) => /* html */ `
    <meta charset=UTF-8 />
    <meta http-equiv="x-ua-compatible" content="ie=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />

    <title>${model.title}</title>
    <meta name="description" content="${model.description}"/>
    <meta name="keywords" content="${model.keywords}"/>

    ${model.pageMetaTags.map((item) => /* html */ `
        ${item.name ? `<meta name="${item.ID}" content="${item.content}" />` : `<meta property="${item.ID}" content="${item.content}" />`}
    `).join('')}

    <link rel="manifest" href="${model.manifestUrl}" />
    <style>
        ${model.stylesheetUrls.map((url) => `<wainclude url="${url}" />`).join('')}
    </style>`;
