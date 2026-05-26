
// This code is based on: https://github.com/sfccplus/super-page-designer

const HashMap = require('dw/util/HashMap');
const PageMgr = require('dw/experience/PageMgr');

module.exports.init = function (editor) {
    // Add Images Manager as Dependency
    const breakoutEditorConfig = new HashMap();
    const breakoutEditor = PageMgr.getCustomEditor(
        'imagesManager.imagesManager',
        breakoutEditorConfig,
    );
    editor.dependencies.put('imagesManager', breakoutEditor);
};

