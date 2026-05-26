const resolver = require('./attributeResolver');

exports.createModel = function createModel(options) {
    const product = options.product;
    const settings = options.settings;
    return {
        label: settings.label || '',
        content: resolver.resolve(product, settings.productAttribute || ''),
        openByDefault: settings.openByDefault === true,
    };
};

exports.template = (model) => {
    if (!model.content) return '';
    return `
<details class="pdp-accordion-item"${model.openByDefault ? ' open' : ''}>
    <summary>${model.label}</summary>
    <div class="pdp-accordion-item__body">${model.content}</div>
</details>`;
};
