const PageRenderHelper = require('*/cartridge/experience/utilities/PageRenderHelper.js');

/**
 * Renders a base image component
 *
 * @param {dw.experience.ComponentScriptContext} context The component context
 * @returns {string} The template to be displayed
 */
exports.render = function render(context) {
    const component = context.component;
    const regions = PageRenderHelper.getRegionModelRegistry(component);

    return require('*/api/partials').create('base/image').html({
        image: context.content.image.file,
        width: context.content.width || '100%',
        link: context.content.link,
        overlayRegion: regions && regions.overlay ? regions.overlay : null,
        overlayPosition: context.content.overlayPosition || 'center',
        overlayWidth: context.content.overlayWidth || 'auto',
        overlayHeight: context.content.overlayHeight || 'auto',
        overlayOffsetX: context.content.overlayOffsetX || '0px',
        overlayOffsetY: context.content.overlayOffsetY || '0px',
    });
};
