function createModel(params) {
    const model = {
        regions: params.regions,
    };
    return model;
}

function template(model) {
    return `${model.regions.announcement.setTagName('div', true).setClassName('announcement').render()}
        <div class="take-row">
            ${model.regions.left.setTagName('div', true).setClassName('left').render()}
            ${model.regions.branding.setTagName('div', true).setClassName('').setComponentClassName('branding take-row').render()}
            ${model.regions.right.setTagName('div', true).setClassName('right').render()}
        </div>
        ${model.regions.menu.setTagName('div', true).setComponentTagName('nav').setComponentClassName('mainmenu').render()}
       
    `;
}
exports.createModel = createModel;
exports.template = template;
