exports.createModel = function createDecoratorModel(model) {
    return model;
};

exports.template = (model) => `<title>${model.pageMetaData.title}</title>
<dialog class="${model.httpParameter.hx}" open>
    <a href="#close"
        aria-label="Close"
        class="close"
        data-target="${model.httpParameter.hx}"
        onClick="this.closest('dialog').outerHTML=''">
        Close
    </a>
    <article>${model.content}</article>
</dialog>`;
