
const HashMap = require('dw/util/HashMap');

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
    const content = context.content;

    model.title = content.title || '';
    model.url = content.url || '#';

    return require('*/api/partials').create('footer/footerLink').html(model);
}
