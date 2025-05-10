
/**
 * Renders the Order Totals Component
*
* @param {dw.experience.ComponentScriptContext} context The component context
* @returns {string} The template to be displayed
*/
exports.render = function render() {
    const URLUtils = require('dw/web/URLUtils');
    const HashMap = require('dw/util/HashMap');
    const PageRenderHelper = require('*/cartridge/experience/utilities/PageRenderHelper.js');
    const model = new HashMap();

    if (PageRenderHelper.isInEditMode()) {
        model.editMode = true;
    } else {
        model.editMode = false;
    }
    const dataLayerUrl = URLUtils.staticURL('js/datalayer.js');

    return `${model.editMode ? 'SFCC Datalayer' : ''}<script type="text/partytown" src="${dataLayerUrl}" charset="utf-8"></script>`;
};
