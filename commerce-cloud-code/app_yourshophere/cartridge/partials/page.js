const Page = function () {};
Page.prototype.content = function (id, input) {
    this.contentId = id;
    this.input = input;
    return this;
};
Page.prototype.decorateWith = function (id) {
    try {
        this.decoratorId = id;
        this.decorator = require(`*/cartridge/partials/${this.decoratorId}`);
        this.decoratorModel = this.decorator.createModel(this.input);
    } catch (error) {
        const Logger = require('dw/system/Logger');
        Logger.error(`Error in decorator createModel ${id}: ${error}
            ${request.httpPath}?${request.httpQueryString}`);
    }
    return this;
};

Page.prototype.html = function () {
    let result = '';
    try {
        const renderer = require('*/cartridge/partials/renderer');
        const top = this.decorator.top(this.decoratorModel);
        const middle = renderer.html(this.contentId)(this.input);
        const bottom = this.decorator.bottom(this.decoratorModel);

        result = top + middle + bottom;
    } catch (error) {
        const Logger = require('dw/system/Logger');
        Logger.error(`Error in decorator html ${this.contentId}: ${error}
            ${request.httpPath}?${request.httpQueryString}`);
    }
    return result;
};

module.exports = new Page();
