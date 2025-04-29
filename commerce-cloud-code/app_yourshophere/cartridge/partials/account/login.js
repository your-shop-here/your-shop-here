/**
 * Creates a model for the login form
 * @returns {Object} The model for the login form
 */
const createModel = () => {
    const Form = require('api/Form');
    const form = new Form('login');
    return {
        formFields: form.rows(),
        action: require('dw/web/URLUtils').url('Login-ProcessLogin'),
        resources: {
            submitButton: require('dw/web/Resource').msg('button.text.loginform', 'translations', 'Login'),
            forgotPassword: require('dw/web/Resource').msg('link.login.forgotpassword', 'translations', 'forgot password?'),
            googleLogin: require('dw/web/Resource').msg('button.text.oauth.google', 'translations', 'Login with Google'),
            facebookLogin: require('dw/web/Resource').msg('button.text.oauth.facebook', 'translations', 'Login with Facebook'),
        },
        urls: {
            passwordReset: require('dw/web/URLUtils').url('Account-PasswordReset'),
        },
        errors: form.getFormErrors(),
    };
};

/**
 * Renders the login form template
 * @param {Object} model The model for the login form
 * @returns {string} The rendered template
 */
const template = (model) => `
        <div class="login-form">
            <form action="${model.action}" method="POST" class="login">
                ${model.errors.length > 0 ? `
                    <div class="alert alert-danger">
                        <ul class="mb-0">
                            ${model.errors.map((error) => `<li>${error}</li>`).join('')}
                        </ul>
                    </div>
                ` : ''}
                ${model.formFields.map((row) => `
                    <div class="form-group${row.length > 1 ? ' row' : ''}">
                        ${row.map((field) => {
        if (field.type === 'checkbox') {
            return `
                <div class="form-group custom-control custom-checkbox">
                    <input type="${field.type}"
                        class="custom-control-input"
                        id="${field.fieldId}"
                        name="${field.fieldId}"
                        ${field.default ? 'checked' : ''}>
                    <label class="custom-control-label" for="${field.fieldId}">
                        ${field.label}
                    </label>
                    ${field.fieldId === 'rememberMe' ? `
                        <a href="${model.urls.passwordReset}" class="forgot-password">
                            ${model.resources.forgotPassword}
                        </a>
                    ` : ''}
                </div>
            `;
        }
        return `
            <label for="${field.fieldId}" class="form-label${field.required ? ' required' : ''}">
                ${field.label}
            </label>
            <input type="${field.type}"
                    id="${field.fieldId}"
                    class="form-control"
                    name="${field.fieldId}"
                    ${field.required ? 'required' : ''}>
        `;
    }).join('')}
                    </div>
                `).join('')}

                <button type="submit" class="btn btn-primary btn-block">
                    ${model.resources.submitButton}
                </button>

                <div class="social-login">
                    <button type="button" class="btn btn-block btn-outline-primary google-login">
                        <i class="fab fa-google"></i>
                        ${model.resources.googleLogin}
                    </button>
                    <button type="button" class="btn btn-block btn-outline-primary facebook-login">
                        <i class="fab fa-facebook"></i>
                        ${model.resources.facebookLogin}
                    </button>
                </div>
            </form>
        </div>
    `;

module.exports = { template, createModel };
