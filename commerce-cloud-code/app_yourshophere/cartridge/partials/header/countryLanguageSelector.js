/**
 * Creates a model for the country language selector partial
 * @param {Object} options The options for the country language selector
 * @param {boolean} options.showFlag Whether to show the flag icon
 * @returns {Object} The model for the country language selector
 */
const createModel = (options) => {
    const Resource = require('dw/web/Resource');
    const URLUtils = require('dw/web/URLUtils');
    const URLAction = require('dw/web/URLAction');
    const Locale = require('dw/util/Locale');
    const site = require('dw/system/Site').getCurrent();
    const availableLocales = site.allowedLocales.toArray().map((locale) => Locale.getLocale(locale));
    const currentLocale = request.locale === 'default' ? availableLocales[0] : Locale.getLocale(request.locale);

    // Convert country code to flag emoji
    const getCountryFlag = (countryCode) => {
        const codePoints = countryCode
            .toUpperCase()
            .split('')
            .map((char) => 127397 + char.charCodeAt());
        return String.fromCodePoint.apply(15, codePoints);
    };

    // Group locales by country
    const localesByCountry = availableLocales.reduce((acc, locale) => {
        const country = locale.country;
        if (!acc[country]) {
            acc[country] = {
                country,
                displayCountry: locale.displayCountry,
                flag: options.showFlag ? getCountryFlag(country) : '',
                locales: [],
            };
        }
        acc[country].locales.push({
            language: locale.language,
            displayLanguage: locale.displayLanguage,
            url: URLUtils.url(new URLAction('Home-Show', site.ID, locale.ID)).toString(),
        });
        return acc;
    }, {});

    // Convert to array and sort by country name
    const groupedLocales = Object.values(localesByCountry).sort((a, b) => a.displayCountry.localeCompare(b.displayCountry));

    return {
        currentLocale: {
            country: currentLocale.country,
            language: currentLocale.language,
            displayCountry: currentLocale.displayCountry,
            displayLanguage: currentLocale.displayLanguage,
            flag: options.showFlag ? getCountryFlag(currentLocale.country) : '',
        },
        groupedLocales,
        resources: {
            selectCountry: Resource.msg('country.language.select.country', 'translations', null),
            selectLanguage: Resource.msg('country.language.select.language', 'translations', null),
            currentCountry: Resource.msg('country.language.current.country', 'translations', null),
            currentLanguage: Resource.msg('country.language.current.language', 'translations', null),
        },
    };
};

/**
 * Renders the country language selector
 * @param {Object} model The model for the country language selector
 * @returns {string} The rendered template
 */
const template = (model) => `
    <div class="country-language-selector">
        <div class="dropdown">
            <button class="btn btn-outline-secondary dropdown-toggle" type="button" id="countryLanguageDropdown" data-bs-toggle="dropdown" aria-expanded="false">
                <span class="country-language-selector-flag">${model.currentLocale.flag}</span> ${model.currentLocale.displayLanguage} (${model.currentLocale.displayCountry})
            </button>
            <ul class="dropdown-menu" aria-labelledby="countryLanguageDropdown">
                ${model.groupedLocales.map((countryGroup) => `
                    <li>
                        <h6 class="dropdown-header">${countryGroup.flag} ${countryGroup.displayCountry}</h6>
                        ${countryGroup.locales.map((locale) => `
                            <a class="dropdown-item ${locale.language === model.currentLocale.language && countryGroup.country === model.currentLocale.country ? 'active' : ''}" 
                               href="${locale.url}">
                                ${locale.displayLanguage}
                            </a>
                        `).join('')}
                        ${countryGroup.locales.length > 1 ? '<div class="dropdown-divider"></div>' : ''}
                    </li>
                `).join('')}
            </ul>
        </div>
    </div>
`;

module.exports = { template, createModel };
