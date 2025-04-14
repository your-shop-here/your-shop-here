/**
 * Creates the model for the skin
 * @param {Object} params - The parameters for the model
 * @returns {Object} The model for the skin
 */
function createModel(params) {
    const model = {
        fonts: params.fonts || [],
        primaryAccentColor: (params.primaryAccentColor && params.primaryAccentColor.value) || '',
        primaryAccentColorInvert: (params.primaryAccentColorInvert && params.primaryAccentColorInvert.value) || '',
        secondaryAccentColor: (params.secondaryAccentColor && params.secondaryAccentColor.value) || '',
        secondaryAccentColorInvert: (params.secondaryAccentColorInvert && params.secondaryAccentColorInvert.value) || '',
        mainBackground: (params.mainBackground && params.mainBackground.value) || '',
        borderColorOne: (params.borderColorOne && params.borderColorOne.value) || '',
        linkColor: (params.linkColor && params.linkColor.value) || '',
        bannerBackground: (params.bannerBackground && params.bannerBackground.value) || '',
        bannerTextColor: (params.bannerTextColor && params.bannerTextColor.value) || '',
        menuTextColor: (params.menuTextColor && params.menuTextColor.value) || '',
        mainTextColor: (params.mainTextColor && params.mainTextColor.value) || '',
        selectBoxBackground: (params.selectBoxBackground && params.selectBoxBackground.value) || '',
        selectBoxTextColor: (params.selectBoxTextColor && params.selectBoxTextColor.value) || '',
        headingColor: (params.headingColor && params.headingColor.value) || '',
        headingColorInvert: (params.headingColorInvert && params.headingColorInvert.value) || '',
        priceTextColor: (params.priceTextColor && params.priceTextColor.value) || '',
        headerfont: params.headerfont || '',
        bodyfont: params.bodyfont || '',
        menufont: params.menufont || '',
        editMode: params.editMode || false,
    };

    return model;
}

/**
 * Renders the skin
 * @param {Object} model - The model for the skin
 * @returns {string} The HTML for the skin
 */
const template = (model) => `
    ${model.fonts.map((font) => {
        const URLUtils = require('dw/web/URLUtils');
        if (font === 'components/fonts/salesforcesans') {
            return `<style>  
                @font-face {
                    font-family: "Salesforce Sans";
                    src: url("${URLUtils.staticURL('fonts/SalesforceSans-Regular.woff')}" ) format('woff');
                    unicode-range: U+0000-007F;
                }

                @font-face {
                    font-family: "Salesforce Sans"; 
                    src: url("${URLUtils.staticURL('fonts/SalesforceSans-Bold.woff')}" ) format('woff');
                    font-weight: bold;
                    unicode-range: U+0000-007F;
                }

                @font-face {
                    font-family: "Salesforce Sans";
                    src: url("${URLUtils.staticURL('fonts/SalesforceSans-BoldItalic.woff')}" ) format('woff');
                    font-weight: bold;
                    font-style: italic;
                    unicode-range: U+0000-007F;
                }

                @font-face {
                    font-family: "Salesforce Sans";
                    src: url("${URLUtils.staticURL('fonts/SalesforceSans-Italic.woff')}" ) format('woff');
                    font-style: italic;
                    unicode-range: U+0000-007F;
                }

                @font-face {
                    font-family: "Salesforce Sans";
                    src: url("${URLUtils.staticURL('fonts/SalesforceSans-LightItalic.woff')}" ) format('woff');
                    font-weight: lighter;
                    font-style: italic;
                    unicode-range: U+0000-007F;
                }

                @font-face {
                    font-family: "Salesforce Sans";
                    src: url("${URLUtils.staticURL('fonts/SalesforceSans-Light.woff')}" ) format('woff');
                    font-weight: lighter;
                    unicode-range: U+0000-007F;
                }
            </style>`;
        }
        if (font === 'components/fonts/roboto') {
            return '<link href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400&display=swap" rel="stylesheet">';
        }
        if (font === 'components/fonts/nunito') {
            return '<link href="https://fonts.googleapis.com/css2?family=Nunito+Sans:wght@600;700&display=swap" rel="stylesheet">';
        }
        return '';
    }).join('')}
    <style>
        :root {
            --ysh-primary: ${model.primaryAccentColor};
            --ysh-primary-invert: ${model.primaryAccentColorInvert};
            --ysh-secondary: ${model.secondaryAccentColor};
            --ysh-secondary-invert: ${model.secondaryAccentColorInvert};
            --ysh-background: ${model.mainBackground};
            --skin-border-color-1: ${model.borderColorOne};
            --skin-link-color-1: ${model.linkColor};
            --skin-banner-background-color-1: ${model.bannerBackground};
            --skin-banner-text-color-1: ${model.bannerTextColor};
            --skin-menu-color-1-invert: ${model.menuTextColor};
            --ysh-text-primary: ${model.mainTextColor};
            --ysh-selectbox-background-color: ${model.selectBoxBackground};
            --ysh-selectbox-text-color: ${model.selectBoxTextColor};
            --skin-heading-color-1: ${model.headingColor};
            --skin-heading-color-1-invert: ${model.headingColorInvert};
            --skin-price-1: ${model.priceTextColor};
            --skin-header-font: '${model.headerfont}';
            --ysh-font-family: '${model.bodyfont}';
            --skin-menu-font: '${model.menufont}';
            --primary: #00FF00
        }
    </style>
    ${model.editMode ? `
        <div style="width:100%; text-align:center; height:4em; padding-top:0.5em;">
            <svg aria-hidden="true" style="width:3em" viewbox="0 0 24 24" >
                <path fill="#00a1e0" d="M22.5 3.4l-1.9-1.9c-.8-.8-1.9-.8-2.6 0L16.5 3c-.2.2-.2.5 0 .6l3.9 4c.2.2.5.2.6 0L22.6 6c.7-.7.7-1.8-.1-2.6zm-7.3 1.5c-.2-.1-.5-.1-.7 0L2.5 17 1 22.2c-.2.5.3 1 .8.9l5.3-1.5H7l12.1-12c.1-.2.1-.5 0-.7l-3.9-4z"></path>
            </svg>
            <span>Skin settings</span>
        </div>
    ` : ''}
`;

module.exports = {
    createModel,
    template,
};
