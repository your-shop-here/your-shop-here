const server = require('*/server');

/**
 * @description Show the login page
 */
server.get('Show', server.middleware.https, (req, res, next) => {
    if (customer.authenticated) {
        res.redirect('Account-Show');
    } else {
        res.page('login');
    }

    next();
});

/**
 * @description Process the login form
 */
server.post('ProcessLogin', server.middleware.https, (req, res, next) => {
    const CustomerMgr = require('dw/customer/CustomerMgr');
    const Resource = require('dw/web/Resource');
    const Transaction = require('dw/system/Transaction');
    const URLUtils = require('dw/web/URLUtils');
    const Form = require('*/api/Form');
    const form = new Form('login');

    const loginForm = {};
    form.clearFormErrors();
    form.persist(loginForm, request.httpParameterMap);
    form.validate(request.httpParameterMap);
    const email = loginForm.loginEmail;
    const password = loginForm.loginPassword;
    const rememberMe = loginForm.loginRememberMe === 'true';
    const redirectUrl = session.privacy.loginRedirectUrl || URLUtils.url('Account-Show');
    res.redirect(redirectUrl);

    const customerLoginResult = Transaction.wrap(() => {
        const authenticateCustomerResult = CustomerMgr.authenticateCustomer(email || '', password || '');

        if (authenticateCustomerResult.status !== 'AUTH_OK') {
            const errorCodes = {
                ERROR_CUSTOMER_DISABLED: 'error.message.account.disabled',
                ERROR_CUSTOMER_LOCKED: 'error.message.account.locked',
                ERROR_CUSTOMER_NOT_FOUND: 'error.message.login.form',
                ERROR_PASSWORD_EXPIRED: 'error.message.password.expired',
                ERROR_PASSWORD_MISMATCH: 'error.message.password.mismatch',
                ERROR_UNKNOWN: 'error.message.error.unknown',
                default: 'error.message.login.form',
            };

            const errorMessageKey = errorCodes[authenticateCustomerResult.status] || errorCodes.default;
            const errorMessage = Resource.msg(errorMessageKey, 'translations', null);

            return {
                error: true,
                errorMessage,
                status: authenticateCustomerResult.status,
                authenticatedCustomer: null,
            };
        }

        return {
            error: false,
            errorMessage: null,
            status: authenticateCustomerResult.status,
            authenticatedCustomer: CustomerMgr.loginCustomer(authenticateCustomerResult, rememberMe),
        };
    });

    if (customerLoginResult.error) {
        form.addFormError(customerLoginResult.errorMessage);
        if (customerLoginResult.status === 'ERROR_CUSTOMER_LOCKED') {
            const Notification = require('*/api/Notification');
            Notification.sendMessage('accountLocked', {
                to: email,
                subject: Resource.msg('subject.account.locked.email', 'translations', null),
                data: {
                    customer: CustomerMgr.getCustomerByLogin(email || '') || null,
                },
            });
        }

        form.temp(request.httpParameterMap);
        res.redirect('Login-Show');
        return next();
    }

    return next();
});

/**
 * @description Process the registration form
 */
server.post(
    'ProcessRegistration',
    server.middleware.https,
    function (req, res, next) {
        const CustomerMgr = require('dw/customer/CustomerMgr');
        const Resource = require('dw/web/Resource');
        const URLUtils = require('dw/web/URLUtils');
        const Form = require('*/api/Form');
        const form = new Form('register');
        res.page('login');

        const registrationForm = {};
        form.clearFormErrors();
        form.persist(registrationForm, request.httpParameterMap);
        form.validate(request.httpParameterMap);
        const redirectUrl = session.privacy.loginRedirectUrl || URLUtils.url('Account-Show');

        // @todo move form validation to form definition
        // if (registrationForm.email.toLowerCase() !== registrationForm.emailConfirm.toLowerCase()) {
        //     form.addFormError(Resource.msg('error.message.mismatch.email', 'translations', null));
        // }

        if (registrationForm.password !== registrationForm.passwordConfirm) {
            form.addFormError(Resource.msg('error.message.mismatch.password', 'translations', null));
        }

        if (!CustomerMgr.isAcceptablePassword(registrationForm.password)) {
            form.addFormError(Resource.msg('error.message.password.constraints.not.matched', 'translations', null));
        }

        // setting variables for the BeforeComplete function
        const registrationFormObj = {
            firstName: registrationForm.firstName,
            lastName: registrationForm.lastName,
            phone: registrationForm.phone,
            email: registrationForm.email,
            password: registrationForm.password,
            passwordConfirm: registrationForm.passwordConfirm,
            validForm: form.getFormErrors().length === 0,
            form: registrationForm,
            redirectUrl,
        };

        if (registrationFormObj.validForm) {
            res.setViewData(registrationFormObj);

            this.on('route:BeforeComplete', (req, res) => {
                const Transaction = require('dw/system/Transaction');
                let authenticatedCustomer;
                let serverError;

                // getting variables for the BeforeComplete function
                const registrationData = res.getViewData();

                if (registrationData.validForm) {
                    const login = registrationData.email;
                    const password = registrationData.password;

                    // attempt to create a new user and log that user in.
                    try {
                        Transaction.wrap(() => {
                            const error = {};
                            const newCustomer = CustomerMgr.createCustomer(login, password);

                            const authenticateCustomerResult = CustomerMgr.authenticateCustomer(login, password);
                            if (authenticateCustomerResult.status !== 'AUTH_OK') {
                                error.authError = true;
                                error.status = authenticateCustomerResult.status;
                                throw error;
                            }

                            authenticatedCustomer = CustomerMgr.loginCustomer(authenticateCustomerResult, false);

                            if (!authenticatedCustomer) {
                                error.authError = true;
                                error.status = authenticateCustomerResult.status;
                                throw error;
                            } else {
                                // assign values to the profile
                                const newCustomerProfile = newCustomer.getProfile();
                                if (newCustomerProfile) {
                                    // @todo do this via Form
                                    newCustomerProfile.firstName = registrationData.firstName;
                                    newCustomerProfile.lastName = registrationData.lastName;
                                    newCustomerProfile.phoneHome = registrationData.phone;
                                    newCustomerProfile.email = registrationData.email;
                                }
                            }
                        });
                    } catch (e) {
                        if (e.authError) {
                            serverError = true;
                        } else {
                            registrationData.validForm = false;
                            registrationData.form.customer.email.error = Resource.msg('error.message.username.invalid', 'translations', null);
                        }
                    }
                }

                delete registrationData.password;
                delete registrationData.passwordConfirm;

                if (serverError) {
                    res.setStatusCode(500);
                    form.addError(Resource.msg('error.message.unable.to.create.account', 'translations', null));
                    return next();
                }

                if (registrationData.validForm && authenticatedCustomer) {
                    const Notification = require('*/api/Notification');
                    Notification.sendMessage('registration', {
                        to: authenticatedCustomer.profile.email,
                        subject: Resource.msg('email.subject.welcome', 'translations', 'Welcome to Your Shop Here!'),
                        data: {
                            customer: authenticatedCustomer.profile,
                        },
                    });
                }
                res.redirect(redirectUrl);
                return next();
            });
        }
        form.temp(request.httpParameterMap);
        return next();
    },
);

/**
 * @description Logout the customer
 */
server.get('Logout', (req, res, next) => {
    const URLUtils = require('dw/web/URLUtils');
    const CustomerMgr = require('dw/customer/CustomerMgr');

    CustomerMgr.logoutCustomer(false);
    res.redirect(URLUtils.url('Home-Show'));
    next();
});

/**
 * @description OAuth login endpoint
 * @todo test and fix
 */
server.get('OAuthLogin', server.middleware.https, (req, res, next) => {
    const oauthLoginFlowMgr = require('dw/customer/oauth/OAuthLoginFlowMgr');
    const Resource = require('dw/web/Resource');
    const endpoints = require('*/cartridge/config/oAuthRenentryRedirectEndpoints');

    const targetEndPoint = req.querystring.oauthLoginTargetEndPoint
        ? parseInt(req.querystring.oauthLoginTargetEndPoint.toString(), 10)
        : null;

    if (targetEndPoint && endpoints[targetEndPoint]) {
        req.session.privacyCache.set(
            'oauthLoginTargetEndPoint',
            endpoints[targetEndPoint],
        );
    } else {
        res.renderPartial('error/error', {
            object: {
                message: Resource.msg('error.oauth.login.failure', 'translations', null),
            },
            decorator: 'decorator/ssr',
        });

        return next();
    }

    if (req.querystring.oauthProvider) {
        const oauthProvider = req.querystring.oauthProvider.toString();
        const result = oauthLoginFlowMgr.initiateOAuthLogin(oauthProvider);

        if (result) {
            res.redirect(result.location);
        } else {
            res.renderPartial('error/error', {
                object: {
                    message: Resource.msg('error.oauth.login.failure', 'translations', null),
                },
                decorator: 'decorator/ssr',
            });

            return next();
        }
    } else {
        res.renderPartial('error/error', {
            object: {
                message: Resource.msg('error.oauth.login.failure', 'translations', null),
            },
            decorator: 'decorator/ssr',
        });

        return next();
    }

    return next();
});

/**
 * @description OAuth reentry endpoint
 * @todo test and fix
 */
server.get('OAuthReentry', server.middleware.https, (req, res, next) => {
    const URLUtils = require('dw/web/URLUtils');
    const oauthLoginFlowMgr = require('dw/customer/oauth/OAuthLoginFlowMgr');
    const CustomerMgr = require('dw/customer/CustomerMgr');
    const Transaction = require('dw/system/Transaction');
    const Resource = require('dw/web/Resource');

    const destination = req.session.privacyCache.store.oauthLoginTargetEndPoint;

    const finalizeOAuthLoginResult = oauthLoginFlowMgr.finalizeOAuthLogin();
    if (!finalizeOAuthLoginResult) {
        res.redirect(URLUtils.url('Login-Show'));
        return next();
    }

    const response = finalizeOAuthLoginResult.userInfoResponse.userInfo;
    const oauthProviderID = finalizeOAuthLoginResult.accessTokenResponse.oauthProviderId;

    if (!oauthProviderID) {
        res.renderPartial('error/error', {
            object: {
                message: Resource.msg('error.oauth.login.failure', 'translations', null),
            },
            decorator: 'decorator/ssr',
        });

        return next();
    }

    if (!response) {
        res.renderPartial('error/error', {
            object: {
                message: Resource.msg('error.oauth.login.failure', 'translations', null),
            },
            decorator: 'decorator/ssr',
        });

        return next();
    }

    const externalProfile = JSON.parse(response);
    if (!externalProfile) {
        res.renderPartial('error/error', {
            object: {
                message: Resource.msg('error.oauth.login.failure', 'translations', null),
            },
            decorator: 'decorator/ssr',
        });

        return next();
    }

    const userID = externalProfile.id || externalProfile.uid;
    if (!userID) {
        res.renderPartial('error/error', {
            object: {
                message: Resource.msg('error.oauth.login.failure', 'translations', null),
            },
            decorator: 'decorator/ssr',
        });

        return next();
    }

    let authenticatedCustomerProfile = CustomerMgr.getExternallyAuthenticatedCustomerProfile(
        oauthProviderID,
        userID,
    );

    if (!authenticatedCustomerProfile) {
        // Create new profile
        Transaction.wrap(() => {
            const newCustomer = CustomerMgr.createExternallyAuthenticatedCustomer(
                oauthProviderID,
                userID,
            );

            authenticatedCustomerProfile = newCustomer.getProfile();
            let firstName;
            let lastName;
            let email;

            // Google comes with a 'name' property that holds first and last name.
            if (typeof externalProfile.name === 'object') {
                firstName = externalProfile.name.givenName;
                lastName = externalProfile.name.familyName;
            } else {
                // The other providers use one of these, GitHub has just a 'name'.
                firstName = externalProfile['first-name']
                    || externalProfile.first_name
                    || externalProfile.name;

                lastName = externalProfile['last-name']
                    || externalProfile.last_name
                    || externalProfile.name;
            }

            email = externalProfile['email-address'] || externalProfile.email;

            if (authenticatedCustomerProfile) {
                authenticatedCustomerProfile.setFirstName(firstName);
                authenticatedCustomerProfile.setLastName(lastName);
                authenticatedCustomerProfile.setEmail(email);
            }
        });
    }

    if (authenticatedCustomerProfile) {
        const credentials = authenticatedCustomerProfile.getCredentials();
        if (credentials.isEnabled()) {
            Transaction.wrap(() => {
                CustomerMgr.loginExternallyAuthenticatedCustomer(oauthProviderID, userID, false);
            });
        } else {
            res.renderPartial('error/error', {
                object: {
                    message: Resource.msg('error.oauth.login.failure', 'translations', null),
                },
                decorator: 'decorator/ssr',
            });

            return next();
        }
    }

    req.session.privacyCache.clear();
    res.redirect(URLUtils.url(destination));

    return next();
});

module.exports = server.exports();
