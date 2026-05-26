function createModel(params) {
    return {
        heading: params.heading,
        regions: params.regions,
    };
}

function template(model) {
    return `<div class="ysh-footer__link-column">
        <p class="ysh-footer__link-column-heading">${model.heading}</p>
        ${model.regions.links.setTagName('ul', false).setClassName('ysh-footer__link-list').setComponentTagName('li').setComponentClassName('').render()}
    </div>`;
}

exports.createModel = createModel;
exports.template = template;
