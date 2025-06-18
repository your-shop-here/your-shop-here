
let subDecorator;

exports.createModel = function createDecoratorModel(input) {
    const model = input.model;
    const httpParams = model.httpParameter;
    const pageMetaData = model.pageMetaData;
    const partials = require('*/api/partials');
    let chosenDecorator = partials.create('decorator/ssr');
    const hxValue = httpParams.hx;
    if (hxValue) {
        if (hxValue === 'main') {
            chosenDecorator = partials.create('decorator/hx');
        } else if (hxValue.includes('modal')) {
            chosenDecorator = partials.create('decorator/hxmodal');
        }
    }

    const Locale = require('dw/util/Locale');
    model.lang = Locale.getLocale(request.locale).language;
    model.pageMetaData = pageMetaData;
    model.chosenDecorator = chosenDecorator;
    model.content = input.content;
    return model;
};

exports.template = (input) =>input.chosenDecorator.html(input);

