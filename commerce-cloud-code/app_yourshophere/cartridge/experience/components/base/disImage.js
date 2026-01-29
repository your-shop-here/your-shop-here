/**
 * Renders a DIS image component using the custom imageInput editor
 *
 * @param {dw.experience.ComponentScriptContext} context The component context
 * @returns {string} The template to be displayed
 */
exports.render = function render(context) {
    const PageRenderHelper = require('*/cartridge/experience/utilities/PageRenderHelper.js');

    // Extract image URL from custom editor value object
    const disImageValue = context.content.disImage;
    const component = context.component;
    const content = context.content;
    const overlayPosition = content.overlayPosition || {};
    const crops = disImageValue.crops ? disImageValue.crops.toArray() : [];
    return require('*/api/partials').create('base/disImage').html({
        imagePath: disImageValue.imagePath,
        sourceDimensions: disImageValue.sourceDimensions,
        quality: disImageValue.quality,
        crops,
        altText: content.altText || '',
        link: content.link,
        width: content.width || '100%',
        regions: PageRenderHelper.getRegionModelRegistry(component),
        overlayPosition: {
            position: overlayPosition.position, padding: overlayPosition.padding, paddingUnit: overlayPosition.unit, backgroundColor: overlayPosition.backgroundColor || 'none', transparency: overlayPosition.transparency || 100,
        },
        outputFileType: disImageValue.outputFileType || 'jpg',
        forceWidth: disImageValue.forceWidth || null,
        forceHeight: disImageValue.forceHeight || null,
    });
};

