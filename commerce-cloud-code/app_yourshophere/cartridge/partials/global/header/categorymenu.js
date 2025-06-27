const lazyload = require('*/cartridge/utils/lazyload.js');

function createModel(apiCategory) {
    const model = {
        apiCategory,
    };

    lazyload(model, 'hidden', () => !apiCategory.custom.yshShowInMenu);
    lazyload(model, 'children', () => apiCategory.onlineSubCategories.toArray(0, 50).map((subCategory) => createModel(subCategory)).filter((cat) => !cat.hidden));
    lazyload(model, 'url', () => dw.web.URLUtils.url('Search-Show', 'cgid', apiCategory.ID));
    return model;
}

function template(model) {
    return `
        <label for="hamburger" id="toggle-menu">&#9776;</label>
        <input type="checkbox" id="hamburger" />
        <ul id="menu-root">
            ${model.children.map((childCategory) => subMenuTemplate(childCategory, 0)).join('')}
        </ul>        
    `;
}
const maxLevel = 2;

function subMenuTemplate(currentCategory, level) {
    return `
        <li>
            ${!currentCategory.hidden ? (`
                <a href="${currentCategory.url}" 
                    hx-push-url="${currentCategory.url}" 
                    hx-get="${currentCategory.url.append('hx', 'main')}"
                    hx-target="main" hx-indicator=".progress">
                        ${currentCategory.apiCategory.displayName}
                </a>
                ${(level < maxLevel && currentCategory.children && currentCategory.children.length > 0) ? (`
                    <label 
                        title="Toggle Drop-down" 
                        class="drop-icon" 
                        role="button" 
                        for="navbar-toggler-${currentCategory.ID}">
                    </label>
                    <input type="checkbox" id="navbar-toggler-${currentCategory.ID}">
                    <ul class="sub-menu">
                        ${currentCategory.children.map((childCategory) => subMenuTemplate(childCategory, level + 1)).join('')}
                    </ul>
                `) : ''} 
            `) : ''}
        </li>      
    `;
}
exports.createModel = createModel;
exports.template = template;
