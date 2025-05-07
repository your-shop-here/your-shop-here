/**
 * Creates a model for the welcome back partial
 * @param {Object} params - The parameters object containing customer and settings
 * @param {dw.customer.Customer} params.customer - The authenticated customer object
 * @param {Object} [params.settings] - Optional settings from the component
 * @returns {Object} The model for the welcome back message
 */
const createModel = (params) => {
    const Resource = require('dw/web/Resource');
    const URLUtils = require('dw/web/URLUtils');
    const StringUtils = require('dw/util/StringUtils');
    const customer = params && params.customer;
    let firstName = ''; let lastName = '';
    if (customer && customer.profile && customer.profile.firstName) {
        firstName = customer.profile.firstName;
    }
    if (customer && customer.profile && customer.profile.lastName) {
        lastName = customer.profile.lastName;
    }
    let message;
    if (firstName) {
        if (params.settings && params.settings.welcomeMessage) {
            message = StringUtils.format(params.settings.welcomeMessage, firstName, lastName);
        } else {
            message = Resource.msgf('welcome.back.named', 'translations', null, firstName, lastName);
        }
    } else {
        message = Resource.msg('welcome.back', 'translations', null);
    }
    return {
        firstName,
        isAuthenticated: customer && customer.authenticated,
        message,
        settings: params && params.settings,
        logoutUrl: URLUtils.url('Login-Logout'),
        logoutText: Resource.msg('button.logout', 'translations', null),
    };
};

/**
 * Renders the welcome back message
 * @param {Object} model The model for the welcome back message
 * @returns {string} The rendered template
 */
const template = (model) => `
    <div class="welcome-back-message alert alert-success" role="alert">
        <strong>${model.message}</strong>
        <a href="${model.logoutUrl}" class="btn btn-secondary btn-sm float-end ms-3">${model.logoutText}</a>
    </div>
`;

module.exports = { template, createModel };
