module.exports = function addLazyProperty(object, name, callback) {
    Object.defineProperty(object, name, {
        get: function () {
            return callback.apply(object, [object]);
        },
        configurable: true,
    });
};
