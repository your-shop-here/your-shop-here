
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
    const transformationObject = {};
    disImageValue.crops.toArray().forEach((crop) => {
        // Crop values are stored as percentages; convert back to absolute px.
        transformationObject.cropX = (crop.topLeft.x / 100) * disImageValue.sourceDimensions.width;
        transformationObject.cropY = (crop.topLeft.y / 100) * disImageValue.sourceDimensions.height;
        transformationObject.cropWidth = (crop.sizePercent.width / 100) * disImageValue.sourceDimensions.width;
        transformationObject.cropHeight = (crop.sizePercent.height / 100) * disImageValue.sourceDimensions.height;
    });
    const imageUrl = URLUtils.httpsImage(URLUtils.CONTEXT_LIBRARY, ContentMgr.getSiteLibrary().ID, disImageValue.imagePath, transformationObject);
    return require('*/api/partials').create('base/disImage').html({
        imageUrl,
        altText: context.content.altText || '',
        link: context.content.link,
        width: context.content.width || '100%',
    });
};

