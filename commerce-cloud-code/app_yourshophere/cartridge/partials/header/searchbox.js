const URLUtils = require('dw/web/URLUtils');

/**
 * Creates the model for the search box
 * @param {Object} params - The parameters for the model
 * @returns {Object} The model for the search box
 */
function createModel(params) {
    const model = {
        placeholderText: params.placeholderText || 'Search',
        accesssibilityLabel: params.accesssibilityLabel || 'Enter keyword or Item No',
    };
    return model;
}

/**
 * Renders the search box
 * @param {Object} model - The model for the search box
 * @returns {string} The HTML for the search box
 */
function template(model) {
    return `
        <form role="search"
            action="${URLUtils.url('Search-Show')}"
            method="get"
            name="simpleSearch">
            <input class="form-control search-field"
                type="search"
                name="q"
                value=""
                placeholder="${model.placeholderText}"
                role="combobox"
                aria-describedby="search-assistive-text"
                aria-haspopup="listbox"
                aria-owns="search-results"
                aria-expanded="false"
                aria-autocomplete="list"
                aria-activedescendant=""
                aria-controls="search-results"
                aria-label="${model.accesssibilityLabel}" />
        </form>
    `;
}

module.exports = {
    createModel,
    template,
};
