'use strict';

// This code is based on: https://github.com/sfccplus/super-page-designer

var HashMap = require('dw/util/HashMap');
var PageMgr = require('dw/experience/PageMgr');

module.exports.init = function (editor) {
    // Add Images Manager as Dependency
    var breakoutEditorConfig = new HashMap();
    var breakoutEditor = PageMgr.getCustomEditor(
        'imagesManager.imagesManager',
        breakoutEditorConfig
    );
    editor.dependencies.put('imagesManager', breakoutEditor);
};

