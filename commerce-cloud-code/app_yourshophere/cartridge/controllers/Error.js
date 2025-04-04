// The Error controller doesn't use server.js (express, sfra-style)
// As it would require special handling there
// and it should work even if we have a problem there

const system = require('dw/system/System');
const Resource = require('dw/web/Resource');
const ISML = require('dw/template/ISML');
const Logger = require('api/Logger');

exports.Start = (args) => {
    response.setStatus(500);
    const errorReference = require('dw/util/UUIDUtils').createUUID();
    let exposedError;
    const errorText = `Error controller called with ${args.ErrorText} (${errorReference})`;
    Logger.error(errorText);

    if (system.getInstanceType() !== system.PRODUCTION_SYSTEM) {
        exposedError = {
            msg: errorText,
            reference: errorReference,
            controllerName: args.ControllerName,
            startNodeName: args.CurrentStartNodeName,
        };
    } else {
        exposedError = { msg: `Error Reference ${errorReference}`, reference: errorReference };
    }
    if (request.httpHeaders.get('x-requested-with') === 'XMLHttpRequest') {
        response.setContentType('application/json');
        response.writer.print(JSON.stringify({
            error: exposedError,
            message: Resource.msg('subheading.error.general', 'translations', null),
        }));
    } else {
        // @todo remove isml
        ISML.renderTemplate('error/error', {
            error: exposedError,
            showError: true,
            message: Resource.msg('subheading.error.general', 'translations', null),
            lang: require('dw/util/Locale').getLocale(request.getLocale()).getLanguage(),
        });
    }
};
exports.Start.public = true;

exports.ErrorCode = () => {
    response.setStatus(500);
    const errorMessage = `message.error.${req.querystring.err}`;
    // @todo remove isml
    ISML.renderTemplate('error/error', {
        error: { msg: errorMessage },
        message: Resource.msg(errorMessage, 'translations', null),
    });
};
exports.ErrorCode.public = true;

exports.Forbidden = () => {
    const URLUtils = require('dw/web/URLUtils');
    const CustomerMgr = require('dw/customer/CustomerMgr');
    Logger.error(`Error forbidden called sid ${session.sessionID} cid ${customer.customerID}`);
    CustomerMgr.logoutCustomer(true);
    response.redirect(URLUtils.url('Home-Show'));
};
exports.Forbidden.public = true;
