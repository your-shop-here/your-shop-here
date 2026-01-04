/**
 * Renders a DIS image component using the custom imageInput editor
 *
 * @param {dw.experience.ComponentScriptContext} context The component context
 * @returns {string} The template to be displayed
 */
exports.render = function render(context) {
    // Extract image URL from custom editor value object
    const disImageValue = context.content.disImage;

    // Pass crops array to partial - let the partial generate URLs for each crop type
    const crops = disImageValue.crops ? disImageValue.crops.toArray() : [];

    return require('*/api/partials').create('base/disImage').html({
        imagePath: disImageValue.imagePath,
        sourceDimensions: disImageValue.sourceDimensions,
        quality: disImageValue.quality,
        crops,
        altText: context.content.altText || '',
        link: context.content.link,
        width: context.content.width || '100%',
    });
};

