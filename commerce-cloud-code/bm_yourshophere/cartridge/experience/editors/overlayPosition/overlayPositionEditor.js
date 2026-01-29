/**
 * Server-side initialization for Overlay Position Editor
 * Loads configuration and makes it available to the client-side editor
 */

const overlayPositionConfig = require('*/cartridge/experience/editors/overlayPosition/overlayPositionConfig.json');

module.exports.init = function (editor) {
    // Load and provide the overlay position configuration to the client-side editor
    editor.configuration.put('overlayPositionConfig', overlayPositionConfig);
};
