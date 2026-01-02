/**
 * SuperPD Controller
 * This code is based on: https://github.com/sfccplus/super-page-designer
 */

'use strict';

var server = require('*/server');
var URLUtils = require('dw/web/URLUtils');

/**
 * This controller returns images paths inside the current site library
 * Supports Dynamic Imaging Service transformations (crop, quality, width, height)
 */
server.get('ImageURL', function (req, res, next) {
    const siteLibrary = dw.content.ContentMgr.getSiteLibrary();

    const transformationObject = {};

    const querystring = req.querystring;
    if (querystring.cropX) {
        transformationObject.cropX = +querystring.cropX;
        transformationObject.cropY = +querystring.cropY;
        transformationObject.cropWidth = +querystring.cropWidth;
        transformationObject.cropHeight = +querystring.cropHeight;
    }

    if (querystring.quality) {
        transformationObject.quality = +querystring.quality;
    }

    if (querystring.width) {
        transformationObject.scaleWidth = +querystring.width;
    }

    if (querystring.height) {
        transformationObject.scaleHeight = +querystring.height;
    }

    var libraryUrl = URLUtils.imageURL(
        URLUtils.CONTEXT_LIBRARY,
        siteLibrary.ID,
        req.querystring.imagePath,
        transformationObject
    ).toString();

    res.redirect(libraryUrl);
    next();
});

module.exports = server.exports();

