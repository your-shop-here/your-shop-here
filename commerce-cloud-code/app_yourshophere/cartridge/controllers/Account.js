const server = require('*/server');

const userLoggedIn = require('*/cartridge/middleware/userLoggedIn');

/**
 * Show the account page
 * @TODO implement account page and loggedin middleware
 */
server.get('Show', server.middleware.https, userLoggedIn.validateLoggedIn, (req, res, next) => {
    res.page('account');
    next();
});

/**
 * Delete an address from the user's address book
 */
server.post('DeleteAddress', server.middleware.https, userLoggedIn.validateLoggedIn, (req, res, next) => {
    const URLUtils = require('dw/web/URLUtils');
    const Resource = require('dw/web/Resource');
    const Logger = require('dw/system/Logger');

    const addressId = request.httpParameterMap.addressId.stringValue;
    const hxpartial = request.httpParameterMap.hxpartial.stringValue;
    if (!customer.isRegistered() || !addressId) {
        Logger.error('Account-DeleteAddress: Unauthorized attempt or missing addressId. Registered: {0}, addressId: {1}', customer.isRegistered(), addressId);
        throw new Error('Unauthorized or missing addressId');
    }
    const customerProfile = customer.getProfile();
    const addressBook = customerProfile.getAddressBook();
    let success = false;
    let errorMsg = '';
    if (addressBook) {
        const address = addressBook.getAddress(addressId);
        if (address) {
            const Transaction = require('dw/system/Transaction');
            Transaction.wrap(() => {
                addressBook.removeAddress(address);
                success = true;
            });
        } else {
            errorMsg = Resource.msg('error.address.notfound', 'translations', null) || 'Address not found.';
        }
    } else {
        errorMsg = Resource.msg('error.address.invalid', 'translations', null) || 'Invalid address.';
    }

    if (hxpartial) {
        // Re-render the addressbook partial for HTMX
        const options = {
            object: {},
        };
        res.renderPartial(hxpartial, options);
    } else if (success) {
        res.redirect(URLUtils.url('Account-Show'));
    } else {
        res.setStatusCode(400);
        res.json({ error: true, message: errorMsg });
    }
    return next();
});

server.get('Profile', server.middleware.https, userLoggedIn.validateLoggedIn, (req, res, next) => {
    res.page('account-profile');
    next();
});

server.get('AddressBook', server.middleware.https, userLoggedIn.validateLoggedIn, (req, res, next) => {
    res.page('account-addressbook');
    next();
});

server.get('Preferences', server.middleware.https, userLoggedIn.validateLoggedIn, (req, res, next) => {
    res.page('account-preferences');
    next();
});

module.exports = server.exports();
