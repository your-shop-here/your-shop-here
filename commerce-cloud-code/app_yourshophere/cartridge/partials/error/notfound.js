const Resource = require('dw/web/Resource');

exports.createModel = (options) => ({
    reason: options.reason || Resource.msg('page_not_found', 'translations', null),
    lang: options.lang || 'en',
    labels: {
        heading: Resource.msg('page_not_found', 'translations', null),
    },
});

exports.template = (model) => `
    <div class="notfound-page">
        <h1>${model.labels.heading}</h1>
        <p>${model.reason}</p>
    </div>
`;
