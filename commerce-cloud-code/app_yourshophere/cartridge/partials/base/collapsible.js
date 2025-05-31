exports.createModel = function createModel(options) {
    return {
        hintText: options.settings.hintText,
        regionHtml: options.regions.collapsed.render(),
    };
};

/**
 * Renders a Product Description Component
 *
 * @param {dw.experience.ComponentScriptContext} context The component context
 * @returns {string} The template to be displayed
 */
exports.template = (model) => `<details>
    <summary>${model.hintText}</summary>
    <p>${model.regionHtml}</p>
  </details>`;
