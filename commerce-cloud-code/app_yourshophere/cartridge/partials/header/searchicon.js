const URLUtils = require('dw/web/URLUtils');
const SVG = require('*/cartridge/scripts/theming/svg.js');

/**
 * Creates the model for the search icon
 * @param {Object} params - The parameters for the model
 * @returns {Object} The model for the search icon
 */
function createModel(params) {
    const model = {
        type: 'img',
        content: '',
        componentColor: '',
        searchUrl: URLUtils.url('Search-Show'),
        searchWithTermUrl: URLUtils.url('Search-Show', 'q', 'shirt'),
        suggestionsUrl: URLUtils.url('Search-Suggestions', 'q'),
    };

    if (params.icon) {
        const iconInfo = SVG.getInlinableContent(params.icon.file);
        model.type = iconInfo.type;
        model.content = iconInfo.content;
    }

    if (params.color) {
        model.componentColor += `background-color: ${params.color.value}`;
    }
    if (params.brightness) {
        model.componentColor += `;opacity: ${params.brightness}%`;
    }

    return model;
}

/**
 * Renders the search icon
 * @param {Object} model - The model for the search icon
 * @returns {string} The HTML for the search icon
 */
function template(model) {
    return `
        <a href="${model.searchWithTermUrl}" class="search-icon header-svg-icon" data-toggle="modal" data-target="#searchModal">
            ${model.type === 'SVG' ? model.content : `<img src="${model.content}"/>`}
        </a>

        <div class="modal fade" id="searchModal" tabindex="-1"
            role="dialog" aria-labelledby="searchModalLabel" aria-hidden="true">
            <div class="modal-dialog" role="document">
                <div class="modal-content">
                    <form id="searchForm" action="${model.searchUrl}" method="GET">
                        <div class="modal-body">
                            <input ${model.componentColor ? `style="${model.componentColor}"` : ''}
                                class="form-control search-field" name="q" placeholder="Enter Term" autocomplete="off"/>
                            <div ${model.componentColor ? `style="${model.componentColor}"` : ''}
                                class="modal-footer">
                                <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
                                <button type="button" class="btn btn-primary" onclick="$('#searchForm').submit()">Search</button>
                            </div>
                            <div class="suggestions-wrapper" data-url="${model.suggestionsUrl}"></div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    `;
}

module.exports = {
    createModel,
    template,
};
