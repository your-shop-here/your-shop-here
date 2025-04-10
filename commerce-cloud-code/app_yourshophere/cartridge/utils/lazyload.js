module.exports = function addLazyProperty(object, name, callback) {
    Object.defineProperty(object, name, {
        get() {
            return callback.apply(object, [object]);
        },
        configurable: true,
    });
};
