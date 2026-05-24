exports.createModel = function createModel(options) {
    // @TODO implement options
    const model = {
        hasOptions: options.product.optionProduct,
    };

    return model;
};

exports.template = (model) => (model.hasOptions ? 'Wow, this product has options' : '');
