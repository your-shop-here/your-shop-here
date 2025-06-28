exports.createModel = function createDecoratorModel(model) {
    return model;
};

exports.template = (model) => `<title>${model.pageMetaData.title}</title>
<dialog open>
    <a href="#close"
        aria-label="Close"
        class="close"
        data-target="modal-example"
        onClick="this.closest('dialog').outerHTML=''">
        Close
    </a>
    <article>${model.content}</article>
</dialog>`;
