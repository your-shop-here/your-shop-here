/**
 * Rich Text Plus editor configuration
 * Exposes paragraph styles and drop shadow presets to the client editor.
 * @param {Object} editor - Page Designer editor instance
 */
module.exports.init = function init(editor) {
    const paragraphTypes = [
        {
            label: 'Paragraph', value: '', className: '', tagName: 'p',
        },
        {
            label: 'Small print', value: 'small', className: 'para-small', tagName: 'p',
        },
        {
            label: 'Heading 1', value: 'h1', className: 'content-manager-h1', tagName: 'h1',
        },
        {
            label: 'Heading 2', value: 'h2', className: 'content-manager-h2', tagName: 'h2',
        },
        {
            label: 'Heading 3', value: 'h3', className: 'content-manager-h3', tagName: 'h3',
        },
        {
            label: 'Heading 4', value: 'h4', className: 'content-manager-h4', tagName: 'h4',
        },
    ];

    const spanTypes = [
        {
            label: 'Drop Shadow',
            iconAnchor: 'drop_shadow',
            className: 'drop-shadow',
            tagName: 'span',
            previewCss: 'span.drop-shadow { text-shadow: 1px 1px 4px #449; }',
        },
        {
            label: 'Primary Background',
            iconAnchor: 'primary_background',
            className: 'primary-background',
            tagName: 'span',
            previewCss: 'span.primary-background { background-color: #00a1e0; color: #fff; }',
        },
        {
            label: 'Primary Color',
            iconAnchor: 'primary_color',
            className: 'primary-color',
            tagName: 'span',
            previewCss: 'span.primary-color { color: #00a1e0; background-color: #fff; }',
        },
        {
            label: 'Secondary background',
            iconAnchor: 'secondary_background',
            className: 'secondary-background',
            tagName: 'p',
            previewCss: 'span.secondary-background { background-color: #f39c12; color: #fff; }',
        },
        {
            label: 'Secondary-Color',
            iconAnchor: 'secondary_color',
            className: 'secondary-color',
            tagName: 'span',
            previewCss: 'span.secondary-color { color: #f39c12; background-color: #fff; }',
        },
    ];
    const URLUtils = require('dw/web/URLUtils');
    editor.configuration.put('paragraphTypes', JSON.stringify(paragraphTypes));
    editor.configuration.put('spanTypes', JSON.stringify(spanTypes));
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

