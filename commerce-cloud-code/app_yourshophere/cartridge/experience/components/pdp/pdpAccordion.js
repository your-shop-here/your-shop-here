const PageRenderHelper = require('*/cartridge/experience/utilities/PageRenderHelper.js');

exports.render = function render(context) {
    return require('*/api/partials').create('pdp/accordion').html({
        regions: PageRenderHelper.getRegionModelRegistry(context.component),
        product: request.custom.model.product,
    });
};
