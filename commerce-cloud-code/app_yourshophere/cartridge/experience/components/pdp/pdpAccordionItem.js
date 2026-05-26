exports.render = function render(context) {
    return require('*/api/partials').create('pdp/accordionItem').html({
        product: request.custom.model.product,
        settings: context.content,
    });
};
