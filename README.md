# your-shop-here
an experimental reference storefront for Salesforce B2C Commerce.

It's a hobby project with no direct affiliation to Saleforce, Inc.

# Goals and Design Pricniples

- KISS - keep it simple stupid!
- 100 Points at Lighthouse
    - Minimal Javascript, no heavy frameworks
    - Minimal Dom
    - No JSON AJAX requests
- Works with (m)any catalogs without code change
- Page Designer First design for extensiblity and drag & drop customization (clicks, not code)
- Embrace web standards like Javascript, HTML and CSS, minimal propriatarity
- No build steps required - upload and enjoy!
- Have Fun

## Frameworks
- HTMX
- Pico CSS
- CSG Best of Breed 

## Concessions
- No legacy browser compatibility - farewell IE
- Inline CSS is acceptable, if its element specfic
- Template localization

# Getting started

1. Copy `dw.json.example` to `dw.json` and update with your sandbox details
2. Run `npm run all` to install _Your Shop Here_

# Concepts

## Controllers

Controllers use an optimised SFRA like approach which allows for routes to be extended. Most controllers will be very basic as they just render a Page Designer page which will contain the actual page logic. 

## Partials

_Your Shop Here_ introduces the concept of partials, partials need to export two methods

1. `createModel` which returns an object containing the view model
2. `template` which renders the view model to HTML

In the `template` method string templates are used to decorate the data model with HTML which is then directly written to the response stream, thus ISML is no longer required.

Example:
```
exports.createModel = function createModel(product) {
    return {
        name: product.name,
    };
};

exports.template = model => `<h1 class="product-name">${model.name}</h1>`;
```

Why partials?
- Pure Javascript
- No ISML required, less propriarity and more performance
- Great profileability, each component can be measured on model creation and HTML generation times which provides granular and actionable performance insights
- Works well with Page Designer, but components can be used standalone as well

## Forms
How YSH handles forms can be found here [here](docs/concepts/forms-handling.md)

# TODOs
- move activity tracking for Analytics and Einstein to service worker (using i.e. party town)
