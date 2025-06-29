exports.createModel = function createDecoratorModel(model) {
    return model;
};

exports.template = (model) => `${model.content}`;
