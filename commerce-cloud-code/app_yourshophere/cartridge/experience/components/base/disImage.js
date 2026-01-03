
const PageRenderHelper = require('*/cartridge/experience/utilities/PageRenderHelper.js');

/**
 * Renders a DIS image component using the custom imageInput editor
 *
 * @param {dw.experience.ComponentScriptContext} context The component context
 * @returns {string} The template to be displayed
 */
exports.render = function render(context) {
    const component = context.component;
    const regions = PageRenderHelper.getRegionModelRegistry(component);

    // Extract image URL from custom editor value object
    const disImageValue = context.content.disImage;
    const ContentMgr = require('dw/content/ContentMgr');
    const URLUtils = require('dw/web/URLUtils');
    const imageUrl = URLUtils.httpsImage(URLUtils.CONTEXT_LIBRARY, ContentMgr.getSiteLibrary().ID, disImageValue.imagePath, {});
    return require('*/api/partials').create('base/disImage').html({
        imageUrl,
        altText: context.content.altText || '',
        link: context.content.link,
        width: context.content.width || '100%',
    });
};

