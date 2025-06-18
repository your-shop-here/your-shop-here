const URLUtils = require('dw/web/URLUtils');

/**
 * Returns the Salesforce Sans font stylesheet
 * @returns {string} The font stylesheet
 */
function getFont() {
    const CacheMgr = require('dw/system/CacheMgr');
    const fontCache = CacheMgr.getCache('Fonts');
    return fontCache.get('salesforcesans', () => `<style>  
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
    </style>`);
}

module.exports = {
    getFont,
};
