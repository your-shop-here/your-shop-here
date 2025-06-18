exports.createModel = function createModel(options) {
    const URLUtils = require('dw/web/URLUtils');

    const model = {
        regionHtml: options.regions.actions.render(),
        url: URLUtils.url('Cart-Add', 'pid', options.product.ID),
        productId: options.product.ID,
    };

    return model;
};

exports.template = (model) => `
    <form name="pdp-actions" action="${model.url}">
        <input type="hidden" name="pid" value="${model.productId}" />
        ${model.regionHtml}
    </form>`;
