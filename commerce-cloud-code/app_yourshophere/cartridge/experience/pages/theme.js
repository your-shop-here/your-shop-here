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

function renderComponent(context) {
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
                                background: var(--skin-background-color-1, white);
                                padding: 30px;
                                overflow: auto;
                                border: var(--skin-border-color-1, lightgray) 1px solid;
                                min-height: 20em;
                                max-height: 80vh;
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
                                opacity: 0.1;
                                pointer-events: none;
                            }

                            .wireframebox:after {
                                -webkit-transform: rotate(45deg);
                                transform: rotate(45deg);
                            }
                            
                            .preview-section {
                                margin-bottom: 2rem;
                                padding: 1rem;
                                border: 1px solid var(--skin-border-color-1, #dadce0);
                                border-radius: 4px;
                            }
                            
                            .preview-section h3 {
                                margin-top: 0;
                                font-size: 1.2rem;
                                color: var(--skin-heading-color-1-invert, var(--skin-main-text-color-1));
                            }
                            
                            .color-swatch {
                                display: inline-block;
                                width: 50px;
                                height: 50px;
                                border: 1px solid var(--skin-border-color-1, #dadce0);
                                margin: 5px;
                                vertical-align: middle;
                            }
                            
                            .btn {
                                padding: 0.5rem 1rem;
                                margin: 0.25rem;
                                border: 1px solid;
                                border-radius: 4px;
                                cursor: pointer;
                                display: inline-block;
                            }
                            
                            .btn-primary {
                                background-color: var(--skin-primary-color-1);
                                color: var(--skin-primary-color-invert-1);
                                border-color: var(--skin-primary-color-1);
                            }
                            
                            .btn-secondary {
                                background-color: var(--skin-secondary-color-1);
                                color: var(--skin-secondary-color-invert-1);
                                border-color: var(--skin-secondary-color-1);
                            }
                            
                            .btn-outline-primary {
                                background-color: transparent;
                                color: var(--skin-primary-color-1);
                                border-color: var(--skin-primary-color-1);
                            }
                            
                            .alert {
                                padding: 1rem;
                                margin: 0.5rem 0;
                                border-radius: 4px;
                            }
                            
                            .alert-error {
                                background-color: var(--skin-error-color-1);
                                color: white;
                            }
                            
                            .alert-success {
                                background-color: var(--skin-success-color-1);
                                color: white;
                            }
                            
                            .alert-warning {
                                background-color: var(--skin-warning-color-1);
                                color: #202124;
                            }
                            
                            .alert-info {
                                background-color: var(--skin-info-color-1);
                                color: white;
                            }
                            
                            select {
                                padding: 0.5rem;
                                background-color: var(--skin-selectbox-background-color-1);
                                color: var(--skin-selectbox-text-color-1);
                                border: 1px solid var(--skin-border-color-1);
                            }
                            
                            .price {
                                color: var(--skin-price-1);
                                font-weight: bold;
                            }
                        </style>
                        <section class="container">
                            <div class="wireframebox">
                                <h1 style="background-color: var(--skin-heading-color-1, transparent); color: var(--skin-heading-color-1-invert, var(--skin-main-text-color-1)); padding: 0.5rem;">Heading 1 (Header Font: var(--skin-header-font))</h1>
                                <h2 style="background-color: var(--skin-heading-color-1, transparent); color: var(--skin-heading-color-1-invert, var(--skin-main-text-color-1));">Heading 2</h2>
                                <h3>Heading 3</h3>
                                <h4>Heading 4</h4>
                                <h5>Heading 5</h5>
                                <h6>Heading 6</h6>
                                
                                <div class="preview-section">
                                    <h3>Typography</h3>
                                    <p style="color: var(--skin-main-text-color-1); font-family: var(--skin-body-font);">
                                        Body text using main text color and body font. This is regular paragraph text that should use the main text color.
                                    </p>
                                    <p style="font-family: var(--skin-header-font);">Header font example text</p>
                                    <p style="font-family: var(--skin-menu-font);">Menu font example text</p>
                                </div>
                                
                                <div class="preview-section">
                                    <h3>Colors</h3>
                                    <p><strong>Primary Accent:</strong> <span class="color-swatch" style="background-color: var(--skin-primary-color-1);"></span></p>
                                    <p><strong>Secondary Accent:</strong> <span class="color-swatch" style="background-color: var(--skin-secondary-color-1);"></span></p>
                                    <p><strong>Main Background:</strong> <span class="color-swatch" style="background-color: var(--skin-background-color-1);"></span></p>
                                    <p><strong>Banner Background:</strong> <span class="color-swatch" style="background-color: var(--skin-banner-background-color-1);"></span></p>
                                    <p><strong>Border Color:</strong> <span class="color-swatch" style="background-color: var(--skin-border-color-1);"></span></p>
                                </div>
                                
                                <div class="preview-section">
                                    <h3>Buttons</h3>
                                    <p><button class="btn btn-primary">Primary Button</button></p>
                                    <p><button class="btn btn-secondary">Secondary Button</button></p>
                                    <p><button class="btn btn-outline-primary">Outline Primary</button></p>
                                </div>
                                
                                <div class="preview-section">
                                    <h3>Links</h3>
                                    <p><a href="#" style="color: var(--skin-link-color-1);">Link with link color</a></p>
                                </div>
                                
                                <div class="preview-section">
                                    <h3>Select Box</h3>
                                    <select>
                                        <option>Option 1</option>
                                        <option>Option 2</option>
                                        <option>Option 3</option>
                                    </select>
                                </div>
                                
                                <div class="preview-section">
                                    <h3>Price</h3>
                                    <p class="price">$99.99</p>
                                </div>
                                
                                <div class="preview-section">
                                    <h3>Alert Messages</h3>
                                    <div class="alert alert-error">Error message</div>
                                    <div class="alert alert-success">Success message</div>
                                    <div class="alert alert-warning">Warning message</div>
                                    <div class="alert alert-info">Info message</div>
                                </div>
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
