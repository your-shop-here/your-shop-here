/**
 * The Error controller doesn't use server.js (express-style, sfra-style)
 * This is to ensure we show a proper error-page, even if the express-style framework faces an error
 */

const system = require('dw/system/System');
const Resource = require('dw/web/Resource');
const Logger = require('api/Logger');
const partials = require('partials');

/**
 * This endpoint is called when an error occurs
 * @name controller/Error-Start
 * @param {object} args - The arguments passed to the controller
 * @param {string} args.ErrorText - The error text
 * @param {string} args.ControllerName - The name of the controller
 * @param {string} args.CurrentStartNodeName - The name of the current start node
 */
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
        partials.render('error/error')({
            error: exposedError,
            showError: true,
            message: Resource.msg('subheading.error.general', 'translations', null),
            lang: require('dw/util/Locale').getLocale(request.getLocale()).getLanguage(),
        });
    }
};
exports.Start.public = true;

/**
 * This endpoint is called when an error occurs
 * @name controller/Error-ErrorCode
 */
exports.ErrorCode = () => {
    response.setStatus(500);
    const errorMessage = `message.error.${request.httpParameterMap.errorCode.stringValue}`;
    partials.render('error/error')({
        error: { msg: errorMessage },
        message: Resource.msg(errorMessage, 'translations', null),
    });
};
exports.ErrorCode.public = true;

/**
 * This endpoint is called when a forbidden error occurs
 * @name controller/Error-Forbidden
 */
exports.Forbidden = () => {
    const URLUtils = require('dw/web/URLUtils');
    const CustomerMgr = require('dw/customer/CustomerMgr');
    Logger.error(`Error forbidden called sid ${session.sessionID} cid ${customer.ID}`);
    CustomerMgr.logoutCustomer(true);
    response.redirect(URLUtils.url('Home-Show'));
};
exports.Forbidden.public = true;
