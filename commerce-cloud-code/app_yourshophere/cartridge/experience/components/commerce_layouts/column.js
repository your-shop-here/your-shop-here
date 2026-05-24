const HashMap = require('dw/util/HashMap');

/**
 * Render logic for a flexible column layout with adjustable columns for desktop and mobile
 * @param {dw.experience.ComponentScriptContext} context The Component script context object.
 * @param {dw.util.Map} [modelIn] Additional model values created by another cartridge. This will not be passed in by Commcerce Cloud Plattform.
 *
 * @returns {string} The markup to be displayed
 */
exports.render = function render(context, modelIn) {
    try {
        const model = modelIn || new HashMap();
        const component = context.component;

        return require('*/api/partials').create('layout/column').html({
            context,
            component,
            model,
        });
    } catch (e) {
        const Logger = require('*/api/Logger');

        Logger.error(`Exception on rendering page designer component: ${e.message} at '${e.fileName}:${e.lineNumber}'`);
    }
    return '';
};

