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
        <div class="search-container">
            <label for="search-field" class="search-trigger" aria-label="${model.accesssibilityLabel}">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
            </label>
            
            <div class="search-expanded">
                <form role="search"
                    action="${URLUtils.url('Search-Show')}"
                    method="get"
                    name="simpleSearch">
                    <input class="form-control search-field"
                        id="search-field"
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
                        aria-label="${model.accesssibilityLabel}"
                        hx-get="${URLUtils.url('Search-Suggestions')}"
                        hx-trigger="keyup changed delay:500ms"
                        hx-target="#search-suggestions"
                        hx-indicator=".search-indicator" />
                </form>
                <div id="search-suggestions"></div>
            </div>
            
            <div class="search-indicator" style="display: none;">
                <div class="spinner"></div>
            </div>
        </div>
    `;
}

module.exports = {
    createModel,
    template,
};
