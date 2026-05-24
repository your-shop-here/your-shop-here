const PageMgr = require('dw/experience/PageMgr');

exports.renderSkin = function renderSkin() {
    return PageMgr.renderPage('_main-theme', JSON.stringify({ skin: true }));
};

exports.renderHeader = function renderHeader() {
    return PageMgr.renderPage('_main-theme', JSON.stringify({ header: true }));
};

exports.renderFooter = function renderFooter() {
    return PageMgr.renderPage('_main-theme', JSON.stringify({ footer: true }));
};

exports.renderCheckoutHeader = function renderCheckoutHeader() {
    return PageMgr.renderPage('_checkout-theme', JSON.stringify({ header: true }));
};
