
const Template = require('dw/util/Template');
const HashMap = require('dw/util/HashMap');

let imageContainerDecorator;

/**
 * Render logic for storefront.imageAndText component.
 * @param {dw.experience.ComponentScriptContext} context The Component script context object.
 * @returns {string} The template to be displayed
*/
exports.render = function render(context) {
    try {
        return renderComponent(context);
    } catch (e) {
        const Logger = require('api/Logger');
        Logger.error(`Exception on rendering page designer component: ${e.message} at '${e.fileName}:${e.lineNumber}'`);
    }
};

function renderComponent(context) {
    const model = createViewModel(context);
    return template(model);
}

function createViewModel(context) {
    const content = context.content;
    const tmpModel = Object.create(null);
    imageContainerDecorator = imageContainerDecorator || require('*/cartridge/experience/utilities/decorator/imageContainer.js');
    imageContainerDecorator(tmpModel, content);
    const model = tmpModel.imageContainer;
    // @tothink the wysiwyg editor spits out a paragraph, should we make this configurable?
    model.heading = model.heading.replace('<p>', '');
    model.heading = model.heading.replace(new RegExp('</p>$'), '');
    // @todo utility class
    model.hxlink = `${model.link}${(model.link.includes('?') ? '&' : '?')}hx=main`;
    model.loading = content.loadingMode || 'lazy';
    return model;
}

function template(model) {
    return `
        <figure class="image-component ${model.mainClass}">
            <a href="${model.link}" aria-label="${model.alt}">
                <img class="common-image-component"
                    style="
                        aspect-ratio: ${model.image.aspectRatio};
                        background-image: url(${model.image.mini});
                    "
                    loading="${model.loading}"
                    srcset="${model.image.srcset}"
                    sizes="${model.image.sizes}"
                    src="${model.image.defaultsize}"
                    alt="${model.alt}" title="${model.alt}" 
                />
            </a>
            <figcaption>
                ${!empty(model.heading) ? (`
                    <span class="image-on ${model.overlayTextClass} ${model.verticalAlign} ${model.containerHAlign}">
                        <a href="${model.link}" hx-push-url="${model.link}"
                            aria-label="${model.alt}" hx-get="${model.hxlink}" hx-target="main" hx-indicator=".progress">
                            ${model.heading}
                        </a>
                    </span>
                `) : ''}
                ${!empty(model.ITCText) ? (`
                    <span class="image-below">
                        ${model.ITCText}
                    </span>
                `) : ''}
            
            </figcaption>
        </figure>
    `;
}
