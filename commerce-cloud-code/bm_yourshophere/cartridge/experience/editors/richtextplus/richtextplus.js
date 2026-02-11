/**
 * Rich Text Plus editor configuration
 * Exposes paragraph styles and drop shadow presets to the client editor.
 * @param {Object} editor - Page Designer editor instance
 */
module.exports.init = function init(editor) {
    const richtextplusConfig = require('*/cartridge/experience/editors/richtextplus/richtextplusConfig.json');

    const URLUtils = require('dw/web/URLUtils');
    editor.configuration.put('paragraphTypes', JSON.stringify(richtextplusConfig.paragraphTypes));
    editor.configuration.put('spanTypes', JSON.stringify(richtextplusConfig.spanTypes));
    editor.configuration.put('placeholder', 'Compose your content...');
    editor.configuration.put('symbolsUrl', URLUtils.staticURL('experience/editors/richtextplus/symbols.svg').toString());

    const HashMap = require('dw/util/HashMap');
    const PageMgr = require('dw/experience/PageMgr');
    const breakoutEditorConfig = new HashMap();
    const breakoutEditor = PageMgr.getCustomEditor(
        'imagesManager.imagesManager',
        breakoutEditorConfig,
    );
    editor.dependencies.put('imagesManager', breakoutEditor);
};

