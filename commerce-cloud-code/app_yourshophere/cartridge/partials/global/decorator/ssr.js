exports.top = (model) => `<!DOCTYPE html><html lang="${model.lang}" data-theme="light">

    <head>
        <title>${model.pageMetaData.title}</title>
        ${require('partials').html('global/htmlhead')(model)}
        ${require('*/cartridge/experience/skin.js').renderSkin()}
    </head>
    
    <body class="flairstripes">
        <div class="progress">&nbsp;</div>

        <div class="container">  
        ${require('*/cartridge/experience/skin.js').renderHeader()}
            <main>`;

exports.bottom = () => `
            </main>
            <footer>
                ${require('*/cartridge/experience/skin.js').renderFooter()}
            </footer>
        </div>
        <script src="https://unpkg.com/htmx.org@1.9.6"></script>
    </body>

</html>
`;
