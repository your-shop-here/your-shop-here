const System = require('dw/system/System');

exports.debug = System.getInstanceType() !== System.PRODUCTION_SYSTEM;
