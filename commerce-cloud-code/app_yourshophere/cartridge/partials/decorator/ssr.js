exports.createModel = function createDecoratorModel(params) {
    const model = {
        lang: request.locale.split('_')[0],
        pageMetaData: request.pageMetaData,
        content: params.content,
    };
    return model;
};

exports.template = (model) => /* html */ `<!DOCTYPE html><html lang="${model.lang}" data-theme="light">

    <head>
        <title>${model.pageMetaData.title}</title>
        ${require('*/api/partials').create('global/htmlhead').html(model)}
        ${require('*/cartridge/experience/skin.js').renderSkin()}
    </head>
    
    <body class="flairstripes">
        <div class="progress">&nbsp;</div>

        <div class="container">  
            ${require('*/cartridge/experience/skin.js').renderHeader()}
            <main>
                ${model.content}
            </main>
            <footer>
                ${require('*/cartridge/experience/skin.js').renderFooter()}
            </footer>
        </div>
        <script src="https://unpkg.com/htmx.org@2.0.5"></script>
    </body>

</html>
`;
