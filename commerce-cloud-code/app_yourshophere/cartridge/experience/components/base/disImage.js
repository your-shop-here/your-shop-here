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
    const crops = disImageValue.crops ? disImageValue.crops.toArray() : [];
    return require('*/api/partials').create('base/disImage').html({
        imagePath: disImageValue.imagePath,
        sourceDimensions: disImageValue.sourceDimensions,
        quality: disImageValue.quality,
        crops,
        altText: context.content.altText || '',
        link: context.content.link,
        width: context.content.width || '100%',
        regions: PageRenderHelper.getRegionModelRegistry(component),
        valign: context.content.valign || 'top',
        outputFileType: disImageValue.outputFileType || 'jpg',
        forceWidth: disImageValue.forceWidth || null,
        forceHeight: disImageValue.forceHeight || null,
    });
};

