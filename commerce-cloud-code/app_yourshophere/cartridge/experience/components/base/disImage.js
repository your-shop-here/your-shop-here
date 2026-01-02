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
    const imageUrlValue = context.content.imageUrl;
    const imageUrl = (imageUrlValue && typeof imageUrlValue === 'object' && imageUrlValue.value) 
        ? imageUrlValue.value 
        : (imageUrlValue || null);

    return require('*/api/partials').create('base/disImage').html({
        imageUrl: imageUrl,
        altText: context.content.altText || '',
        link: context.content.link,
        width: context.content.width || '100%',
    });
};

