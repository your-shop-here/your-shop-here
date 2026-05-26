exports.createModel = function createModel(options) {
    return {
        regionHtml: options.regions.items.render(),
    };
};

exports.template = (model) => `<div class="pdp-accordion">${model.regionHtml}</div>`;
