exports.top = (model) => `<title>${model.pageMetaData.title}</title>
<dialog open>
    <a href="#close"
        aria-label="Close"
        class="close"
        data-target="modal-example"
        onClick="this.closest('dialog').outerHTML=''">
    </a>
    <article>`;

exports.bottom = () => '</article></dialog>';
