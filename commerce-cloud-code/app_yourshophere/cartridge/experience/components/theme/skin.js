const HashSet = require('dw/util/HashSet');
const partials = require('partials');
const PageRenderHelper = require('*/cartridge/experience/utilities/PageRenderHelper.js');

// @todo remove the map, have the fonts loader directly plugin might work better
const fontMap = {
    'Salesforce Sans': 'fonts/salesforcesans',
    'Roboto': 'fonts/roboto',
    'Nunito Sans': 'fonts/nunito',
};

function getFontAttributes() {
    const metaDefinition = require('*/cartridge/experience/components/theme/skin.json');
    const fontGroup = metaDefinition.attribute_definition_groups.filter((element) => element.id === 'fonts');
    return fontGroup.pop().attribute_definitions.map((element) => element.id);
}

/**
 * Component which renders the skin settings
 * @param {dw.experience.PageScriptContext} context The page script context object.
 *
 * @returns {string} The template text
 */
exports.render = function render(context) {
    try {
        const content = context.content;
        content.editMode = PageRenderHelper.isInEditMode();
        const model = {};
        const fontAttributes = getFontAttributes();
        const fonts = new HashSet();
        content.keySet().toArray().forEach((element) => {
            model[element] = content[element];
            if (fontAttributes.indexOf(element) > -1 && fontMap[content[element]]) {
                fonts.add1(fontMap[content[element]]);
            }
        });
        model.fonts = fonts.toArray();

        return partials.html('header/skin')(model);
    } catch (e) {
        const Logger = require('api/Logger');
        Logger.error(`Exception on rendering page designer component: ${e.message} at '${e.fileName}:${e.lineNumber}'`);
        return '';
    }
};
