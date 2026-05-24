const apiLogger = require('dw/system/Logger');

const LoggerFacade = {};
const logCache = require('dw/system/CacheMgr').getCache('LogCache');

function unseal(object) {
    return JSON.parse(JSON.stringify(object));
}
// eslint-disable-next-line no-unused-vars
function getStack(object) {
    let stack;
    try {
        throw new Error('');
    } catch (e) {
        stack = e.stack;
    }

    return stack;
}

LoggerFacade.__noSuchMethod__ = function (methodName, methodArgs) {
    if (methodName === 'getLogger') {
        return new LoggerFacade(methodArgs[0], methodArgs[1]);
    }

    const mainRequestID = request.requestID.match(/(.*)-([0-9]-[0-9]{2})$/);
    const existingMessages = unseal(logCache.get('entry') || []);
    existingMessages.push({
        requestId: mainRequestID[1],
        nesting: mainRequestID[2],
        url: request.httpURL.toString(),
        level: methodName,
        message: methodArgs.map((arg) => arg.toString()).join(','),
        stack: getStack()
            .split('\n')
            .map((entry) => entry.replace('\tat ', ''))
            .splice(1),
    });
    logCache.put('entry', existingMessages);
    return apiLogger[methodName].apply(apiLogger, methodArgs);
};
module.exports = LoggerFacade;
