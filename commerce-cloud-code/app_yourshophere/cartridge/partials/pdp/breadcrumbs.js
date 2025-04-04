const URLUtils = require('dw/web/URLUtils');

exports.createModel = function createModel(product, categoryParam) {
    const category = categoryParam || product.primaryCategory;
    const model = {
        name: product.name,
        categoryTree: category && category.parent ? buildCategoryTree(category) : [],
        productUrl: URLUtils.url('Product-Show', 'pid', product.ID).toString(), // Generate product URL
    };

    return model;
};

function buildCategoryTree(category) {
    const tree = [];
    let currentCategory = category;

    while (currentCategory && currentCategory.parent) {
        tree.unshift({
            name: currentCategory.displayName,
            url: URLUtils.url('Search-Show', 'cgid', currentCategory.ID).toString(), // Generate category URL
        });
        currentCategory = currentCategory.parent;
    }

    return tree;
}

exports.template = model => `
    <a href="${URLUtils.httpHome().toString()}">Home</a> >
    ${model.categoryTree.map(cat => `<a href="${cat.url}">${cat.name}</a> >`).join(' ')}
    <a href="${model.productUrl}">${model.name}</a>
`;
