
/**
 * Renders the Order Totals Component
*
* @param {dw.experience.ComponentScriptContext} context The component context
* @returns {string} The template to be displayed
*/
exports.render = function render(context) {
    const HashMap = require('dw/util/HashMap');
    const PageRenderHelper = require('*/cartridge/experience/utilities/PageRenderHelper.js');
    const model = new HashMap();
    const content = context.content;
    const gtmId = content.gtmId;
    if (PageRenderHelper.isInEditMode()) {
        model.editMode = true;
    } else {
        model.editMode = false;
    }

    return `${model.editMode ? 'GTM' : ''}
        <script type="text/partytown" src="https://www.googletagmanager.com/gtag/js?id=${gtmId}"></script>
        <script type="text/partytown">
            window.dataLayer = window.dataLayer || [];
            window.gtag = function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            
            gtag('config', '${gtmId}');
        </script>
        
    `;
};
