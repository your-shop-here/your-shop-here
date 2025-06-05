
let subDecorator;

exports.createModel = function createDecoratorModel(input) {
    const model = input.model;
    const httpParams = model.httpParameter;
    const pageMetaData = model.pageMetaData;
    let subDecoratorPath = '*/cartridge/partials/global/decorator/ssr.js';
    const hxValue = httpParams.hx;
    if (hxValue) {
        if (hxValue === 'main') {
            subDecoratorPath = '*/cartridge/partials/global/decorator/hx.js';
        } else if (hxValue.includes('modal')) {
            subDecoratorPath = '*/cartridge/partials/global/decorator/hxmodal.js';
        }
    }

    const Locale = require('dw/util/Locale');
    model.lang = Locale.getLocale(request.locale).language;
    model.pageMetaData = pageMetaData;
    subDecorator = require(subDecoratorPath);
    return model;
};

exports.top = (input) => subDecorator.top(input);

exports.bottom = (input) => subDecorator.bottom(input);
