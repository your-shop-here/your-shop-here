
const Template = require('dw/util/Template');
const HashMap = require('dw/util/HashMap');

/**
 * Component which renders an list of sub categories - ideally unser in mega menu
 * @param {dw.experience.PageScriptContext} context The page script context object.
 *
 * @returns {string} The template text
 */
exports.render = function render(context) {
    try {
        return renderComponent(context);
    } catch (e) {
        const Logger = require('*/api/Logger');
        Logger.error(`Exception on rendering page designer component: ${e.message} at '${e.fileName}:${e.lineNumber}'`);
    }
};

function renderComponent(context) {
    const content = context.content;
    const model = new HashMap();
    const Categories = require('*/cartridge/models/categories');
    const subCategories = content.category.hasOnlineSubCategories() ? content.category.getOnlineSubCategories() : null;
    const filters = {
        showInMenu: content.applyFilter,
        productFilter: content.productFilter,
    };
    model.categories = new Categories(subCategories, filters, parseInt(content.levels)).categories;
    model.levelClass = 'single';

    model.categories.toArray().forEach((element) => {
        if (element.subCategories) {
            model.levelClass = 'multi';
        }
    });

    return new Template('experience/components/decorator/subcategories').render(model).text;
}
