exports.createModel = function createModel(options) {
    const Resource = require('dw/web/Resource');

    const product = options.product;
    const model = {
        quantity: product.minOrderQuantity,
        stepQuantity: product.stepQuantity,
        title: Resource.msg('quantity', 'translations', null),
    };

    return model;
};

exports.template = (model) => `${model.title} <input type="number" name="qty" value="${model.quantity}" />`;
