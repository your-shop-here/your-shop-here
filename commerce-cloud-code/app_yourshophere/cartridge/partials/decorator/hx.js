exports.createModel = function createDecoratorModel(model) {
    return model;
};

exports.template = (model) => `<title>${model.pageMetaData.title}</title>${model.content}`;
