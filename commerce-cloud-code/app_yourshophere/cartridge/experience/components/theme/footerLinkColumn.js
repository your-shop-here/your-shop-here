
const HashMap = require('dw/util/HashMap');
const PageRenderHelper = require('*/cartridge/experience/utilities/PageRenderHelper.js');

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
    model.heading = content.heading || '';

    return require('*/api/partials').create('footer/footerLinkColumn').html(model);
}
