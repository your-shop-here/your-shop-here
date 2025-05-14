/**
 * Component which renders a country language selector
 * @param {Object} context The context object
 * @param {Object} context.content The content object
 * @param {boolean} context.content.showFlag Whether to show the flag icon
 * @returns {string} The template text
 */
exports.render = function render(context) {
    try {
        const PageRenderHelper = require('*/cartridge/experience/utilities/PageRenderHelper.js');
        const regions = PageRenderHelper.getRegionModelRegistry(context.component);

        const partials = require('partials');
        return `${partials.html('header/countryLanguageSelector')({
            showFlag: context.content.showFlag === true,
        })} ${regions.additionalContent.render()}`;
    } catch (e) {
        const Logger = require('api/Logger');
        Logger.error(`Exception on rendering page designer component: ${e.message} at '${e.fileName}:${e.lineNumber}'`);
    }

    return '';
};
