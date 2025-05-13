
/**
 * Renders the Order Totals Component
*
* @param {dw.experience.ComponentScriptContext} context The component context
* @returns {string} The template to be displayed
*/
exports.render = function render(context) {
    const URLUtils = require('dw/web/URLUtils');
    const HashMap = require('dw/util/HashMap');
    const PageRenderHelper = require('*/cartridge/experience/utilities/PageRenderHelper.js');
    const Logger = require('dw/system/Logger');
    const site = require('dw/system/Site').getCurrent();
    const model = new HashMap();
    const content = context.content;

    model.einsteinApiClient = content.einsteinApiClient;
    model.einsteinSiteId = content.einsteinSiteId || site.getEinsteinSiteID();
    if (PageRenderHelper.isInEditMode()) {
        model.editMode = true;
    } else {
        model.editMode = false;
        if (!model.einsteinApiClient) {
            Logger.error('Einstein API Client is not set, Einstein data collection will not be enabled');
        }
    }
    const einsteinScriptUrl = URLUtils.staticURL('js/sfcc-analytics.js');

    return /* html */`${model.editMode ? 'SFCC Einstein' : ''}
            <script type="text/partytown">
                window.ysh = window.ysh || {};
                
                window.ysh.einsteinApiClient = '${model.einsteinApiClient}';
                window.ysh.einsteinSiteId = '${model.einsteinSiteId}';
            </script>
            <script type="text/partytown" src="${einsteinScriptUrl}" charset="utf-8"></script>        
    `;
};
