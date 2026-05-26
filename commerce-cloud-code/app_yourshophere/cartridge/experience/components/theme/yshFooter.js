
const HashMap = require('dw/util/HashMap');
const PageRenderHelper = require('*/cartridge/experience/utilities/PageRenderHelper.js');

/**
 * Render logic for the site footer
 * @param {dw.experience.ComponentScriptContext} context The Component script context object.
 * @returns {string} The template to be displayed
 */
exports.render = function render(context) {
    try {
        return renderComponent(context);
    } catch (e) {
        const Logger = require('*/api/Logger');
        Logger.error(`Exception on rendering page designer component: ${e.message} at '${e.fileName}:${e.lineNumber}'`);
    }
};

function renderComponent(context) {
    const model = new HashMap();
    const component = context.component;
    const content = context.content;

    model.regions = PageRenderHelper.getRegionModelRegistry(component);

    model.copyrightText = content.copyrightText || '© 2025 Your Shop Here. All rights reserved.';
    model.newsletterHeading = content.newsletterHeading || 'Stay in the Know';
    model.newsletterSubtext = content.newsletterSubtext || 'Sign up for exclusive deals, new arrivals, and more.';
    model.facebookUrl = content.facebookUrl || '#';
    model.instagramUrl = content.instagramUrl || '#';
    model.twitterUrl = content.twitterUrl || '#';
    model.pinterestUrl = content.pinterestUrl || '#';
    model.youtubeUrl = content.youtubeUrl || '#';

    return require('*/api/partials').create('footer/yshFooter').html(model);
}
