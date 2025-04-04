
const URLUtils = require('dw/web/URLUtils');

function createModel() {
    return null;
}

const template = () => `
    <style>
        <wainclude url="${URLUtils.staticURL('style.css')}"/>
        <wainclude url="${URLUtils.staticURL('header.css')}" />
        <wainclude url="${URLUtils.staticURL('experience/layouts.css')}" />
        <wainclude url="${URLUtils.staticURL('experience/components/base/moreImageAndText.css')}" />
        <wainclude url="${URLUtils.staticURL('progress.css')}" />
        <wainclude url="${URLUtils.staticURL('pico.min.css')}" />     
    </style>`;

exports.createModel = createModel;
exports.template = template;
