/**
 * Card decorator - wraps content in a card layout
 */

exports.createModel = function createDecoratorModel(params) {
    const { model, content, originalParams } = params;
    
    // Create the decorator model
    // Use Object.assign instead of spread operator for Rhino compatibility
    const decoratorModel = Object.assign({
        content: content || '', // The rendered content from the original partial
        title: model ? model.title : '',
        cardClass: model ? model.cardClass : 'card',
        showHeader: model ? model.showHeader !== false : true, // Default to true
        showFooter: model ? model.showFooter !== false : true, // Default to true
        // Pass through other data
        ...(model || {})
    }, model || {});
    
    return decoratorModel;
};

exports.template = (model) => `
<div class="${model.cardClass}">
    ${model.showHeader ? `
    <div class="card-header">
        ${model.title ? `<h3 class="card-title">${model.title}</h3>` : ''}
    </div>
    ` : ''}
    
    <div class="card-body">
        ${model.content}
    </div>
    
    ${model.showFooter ? `
    <div class="card-footer">
        <!-- Footer content can be added here -->
    </div>
    ` : ''}
</div>
`; 