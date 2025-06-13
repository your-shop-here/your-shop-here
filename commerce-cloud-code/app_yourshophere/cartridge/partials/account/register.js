const Form = require('*/api/Form');

/**
 * Creates a model for the register form
 * @returns {Object} The model for the register form
 */
const createModel = () => {
    const form = new Form('register');
    const formData = form.getTemp();
    return {
        formFields: formData ? form.rowValues(formData) : form.rows(),
        action: require('dw/web/URLUtils').url('Login-ProcessRegistration'),
        resources: {
            submitButton: require('dw/web/Resource').msg('button.text.createaccount', 'translations', 'Create Account'),
            googleSignup: require('dw/web/Resource').msg('button.text.oauth.google', 'translations', 'Sign up with Google'),
            facebookSignup: require('dw/web/Resource').msg('button.text.oauth.facebook', 'translations', 'Sign up with Facebook'),
        },
        errors: form.getFormErrors(),
    };
};

/**
 * Renders the register form template
 * @param {Object} model The model for the register form
 * @returns {string} The rendered template
 */
const template = (model) => `
        <div class="register-form">
            <form action="${model.action}" method="POST" class="registration">
                ${model.errors.length > 0 ? `
                    <div class="error-message register-error">
                        <ul class="mb-0">
                            ${model.errors.map((error) => `<li>${error}</li>`).join('')}
                        </ul>
                    </div>
                ` : ''}
                ${model.formFields.map((row) => `
                    <div class="form-group${row.length > 1 ? ' row' : ''}">
                        ${row.map((field) => `
                            <div class="${field.type === 'checkbox' ? 'custom-control custom-checkbox' : 'form-field'}">
                                <label for="${field.fieldId}" class="form-label${field.required ? ' required' : ''}">
                                    ${field.label}
                                </label>
                                <input type="${field.type}"
                                       id="${field.fieldId}"
                                       class="form-control"
                                       name="${field.fieldId}"
                                       ${field.placeholder ? `placeholder="${field.placeholder}"` : ''}
                                       ${field.pattern ? `pattern="${field.pattern}"` : ''}
                                       ${field.required ? 'required' : ''}
                                       ${field.value ? `value="${field.value}"` : ''}>
                            </div>
                        `).join('')}
                    </div>
                `).join('')}

                <button type="submit" class="btn btn-primary btn-block">
                    ${model.resources.submitButton}
                </button>

                <div class="social-login">
                    <button type="button" class="btn btn-block btn-outline-primary google-login">
                        <i class="fab fa-google"></i>
                        ${model.resources.googleSignup}
                    </button>
                    <button type="button" class="btn btn-block btn-outline-primary facebook-login">
                        <i class="fab fa-facebook"></i>
                        ${model.resources.facebookSignup}
                    </button>
                </div>
            </form>
        </div>
    `;

module.exports = { template, createModel };
