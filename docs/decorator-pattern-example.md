# Decorator Pattern for Partials

## Overview

The decorator pattern allows you to wrap partials with additional functionality like headers, footers, or styling containers. Each decorator receives the rendered content from the original partial and can inject it into its own template.

## How it Works

1. **Original Partial**: Renders its content normally
2. **Decorator**: Receives the rendered content and wraps it with additional HTML/functionality
3. **Chaining**: Multiple decorators can be chained together

## Basic Usage

```javascript
// In your page controller or partial
const myPartial = require('*/cartridge/partials/renderer')
    .create('content/mainregion')
    .decorateWith('decorator/card')
    .decorateWith('decorator/ssr');

const html = myPartial.html({
    model: {
        title: 'My Card Title',
        cardClass: 'custom-card',
        // ... other model data
    },
    // ... other parameters
});
```

## Creating a Decorator

Every decorator partial should have two functions:

### 1. createModel(params)

```javascript
exports.createModel = function createDecoratorModel(params) {
    const { model, content, originalParams } = params;
    
    // Use Object.assign instead of spread operator for Rhino compatibility
    return Object.assign({
        content: content || '', // The rendered content from the wrapped partial
        // Add decorator-specific properties
        title: model ? model.title : '',
        cssClass: model ? model.cssClass : 'default-class'
    }, model || {}); // Merge other model data
};
```

### 2. template(model)

```javascript
exports.template = (model) => `
<div class="${model.cssClass}">
    <header>
        <h2>${model.title}</h2>
    </header>
    <main>
        ${model.content}
    </main>
    <footer>
        <!-- Footer content -->
    </footer>
</div>
`;
```

## Example Decorators

### Card Decorator
Wraps content in a Bootstrap-style card:

```javascript
// partials/decorator/card.js
exports.createModel = function(params) {
    const { model, content } = params;
    // Use Object.assign for Rhino compatibility
    return Object.assign({
        content: content || '',
        title: model && model.title ? model.title : '',
        cardClass: model && model.cardClass ? model.cardClass : 'card',
        showHeader: model ? model.showHeader !== false : true,
        showFooter: model ? model.showFooter !== false : true
    }, model || {});
};

exports.template = (model) => `
<div class="${model.cardClass}">
    ${model.showHeader ? `<div class="card-header"><h3>${model.title}</h3></div>` : ''}
    <div class="card-body">${model.content}</div>
    ${model.showFooter ? '<div class="card-footer"></div>' : ''}
</div>
`;
```

### Modal Decorator
Wraps content in a modal dialog:

```javascript
// partials/decorator/modal.js
exports.createModel = function(params) {
    const { model, content } = params;
    // Use Object.assign for Rhino compatibility
    return Object.assign({
        content: content || '',
        modalId: model && model.modalId ? model.modalId : 'modal-' + Date.now(),
        title: model && model.title ? model.title : 'Modal',
        size: model && model.size ? model.size : 'lg'
    }, model || {});
};

exports.template = (model) => `
<div class="modal fade" id="${model.modalId}" tabindex="-1">
    <div class="modal-dialog modal-${model.size}">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title">${model.title}</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body">
                ${model.content}
            </div>
        </div>
    </div>
</div>
`;
```

## Advanced Usage

### Decorator Chaining
You can chain multiple decorators:

```javascript
const decoratedPartial = require('*/cartridge/partials/renderer')
    .create('cart/cartitems')
    .decorateWith('decorator/card')      // First: wrap in card
    .decorateWith('decorator/modal')     // Second: wrap card in modal
    .decorateWith('decorator/ssr');      // Third: wrap in full HTML page

const html = decoratedPartial.html({
    model: {
        // Card decorator properties
        title: 'Shopping Cart',
        cardClass: 'cart-card',
        
        // Modal decorator properties
        modalId: 'cart-modal',
        size: 'xl',
        
        // SSR decorator properties
        pageMetaData: {
            title: 'Cart - Your Shop Here'
        }
    }
});
```

### Conditional Decoration

```javascript
// In contentPage.js
function renderComponent(context) {
    const model = new HashMap();
    // ... setup model
    
    let partial = require('*/cartridge/partials/renderer')
        .create('content/mainregion');
    
    // Conditionally add decorators
    if (model.httpParameter.hx) {
        partial = partial.decorateWith('decorator/hx');
    } else {
        partial = partial.decorateWith('decorator/ssr');
    }
    
    if (model.wrapInCard) {
        partial = partial.decorateWith('decorator/card');
    }
    
    return partial.html({ model, context });
}
```

## Best Practices

1. **Error Handling**: Decorators should gracefully handle missing content
2. **Model Validation**: Always check if model properties exist before using them
3. **Performance**: Keep decorator logic lightweight
4. **Naming**: Use descriptive names for decorator IDs
5. **Documentation**: Document what each decorator expects in its model

## Troubleshooting

- **Content not showing**: Check that `${model.content}` is included in the template
- **Model data missing**: Verify the `createModel` function passes through necessary data
- **Chaining issues**: Remember that each decorator wraps the previous one's output
- **Errors**: Check the logs for detailed error messages with file and line numbers 