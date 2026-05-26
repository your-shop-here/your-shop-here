function createModel(params) {
    return {
        title: params.title,
        url: params.url,
    };
}

function template(model) {
    return `<a href="${model.url}">${model.title}</a>`;
}

exports.createModel = createModel;
exports.template = template;
