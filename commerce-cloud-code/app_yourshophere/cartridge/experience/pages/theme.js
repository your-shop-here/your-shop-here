const HashMap = require('dw/util/HashMap');
const PageRenderHelper = require('*/cartridge/experience/utilities/PageRenderHelper.js');
const RegionModelRegistry = require('*/cartridge/experience/utilities/RegionModelRegistry.js');

/**
 * Render logic for the theme page, which regions can be partially included on the rest of the website
 *
 * @param {dw.experience.PageScriptContext} context The page script context object.
 *
 * @returns {string} The template text
 */
exports.render = function render(context) {
    require('*/api/Cache').days(14);
    try {
        return renderComponent(context);
    } catch (e) {
        const Logger = require('*/api/Logger');
        Logger.error(`Exception on rendering page designer component: ${e.message} at '${e.fileName}:${e.lineNumber}'`);
    }
    return '';
};

function renderComponent (context) {
    const model = new HashMap();
    const page = context.page;

    model.page = page;

    // automatically register configured regions
    const metaDefinition = require('*/cartridge/experience/pages/theme.json');
    model.regions = new RegionModelRegistry(page, metaDefinition);

    // Set page metadata
    request.pageMetaData.setTitle(page.pageTitle);
    request.pageMetaData.setDescription(page.pageDescription);
    request.pageMetaData.setKeywords(page.pageKeywords);
    let markup = '';

    if (PageRenderHelper.isInEditMode()) {
        const HookManager = require('dw/system/HookMgr');
        HookManager.callHook('app.experience.editmode', 'editmode');
        model.resetEditPDMode = true;
        model.isInEditMode = true;
    } else {
        const parameters = JSON.parse(context.renderParameters);
        model.isInEditMode = false;
        Object.keys(parameters).forEach((name) => {
            model[name] = parameters[name];

            // This makes the theme tick. When rendering the page, users can decide to only render one region
            // i.e. PageMgr.renderPage('_main-theme', JSON.stringify({ skin: true }));
            if (model.regions[name]) {
                if (name === 'header') {
                    markup = model.regions.header.setTagName('header', false).render();
                } else if (name === 'footer') {
                    markup = model.regions.footer.setTagName('footer', false).render();
                } else {
                    markup = model.regions[name].render();
                }
            }
        });
    }

    if (model.isInEditMode) {
        return /* html */ `<!-- creates a wireframe like site, which can be used to configure the decorating pieces -->
            <!DOCTYPE html>
            <html lang="${model.lang}" data-theme="light">
            <head>
                ${model.canonicalUrl ? `<link rel="canonical" href="${model.canonicalUrl}" />` : ''}
                ${model.regions.skin.render()}
                ${require('*/api/partials').render('global/htmlhead')()}
            </head>

            <body class="flairstripes" data-action="${model.action}" data-querystring="${model.queryString}">
                ${dw.system.HookMgr.callHook('app.template.beforeHeader', 'beforeHeader') || ''}
                <div class="container">
                    <header>
                        ${model.regions.header.setTagName('header', false).render()}
                    </header>
                    <main>
                        <style>
                            .wireframebox {
                                position: relative;
                                background: white;
                                padding: 30px;
                                overflow: hidden;
                                border: lightgray 1px solid;
                                height: 20em;
                            }

                            .wireframebox:before,
                            .wireframebox:after {
                                position: absolute;
                                content: '';
                                background: lightgray;
                                display: block;
                                width: 100%;
                                height: 30px;
                                -webkit-transform: rotate(-45deg);
                                transform: rotate(-45deg);
                                left: 0;
                                right: 0;
                                top: 0;
                                bottom: 0;
                                margin: auto;
                            }

                            .wireframebox:after {
                                -webkit-transform: rotate(45deg);
                                transform: rotate(45deg);
                            }
                        </style>
                        <section class="container">
                            <div class="wireframebox">
                                <h1>Preview</h1>
                                <h2>Heading 2</h2>
                                <p>Text</p>
                                <p><button class="btn btn-primary">Button Primary</button></p>
                                <p><button class="btn btn-outline-primary">Button Outline</button></p>
                                <p><a href="#">Link</a></p>
                            </div>
                        </section>
                    </main>
                    <footer>
                        ${model.regions.footer.render()}
                    </footer>
                </div>
            </body>

            </html>`;
    }
    // render the page
    return markup;
}
