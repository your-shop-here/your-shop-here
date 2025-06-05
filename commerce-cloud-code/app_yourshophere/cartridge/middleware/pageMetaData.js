'use strict';

/**
 * Set page meta Data including page title, page description and page keywords
 *
 * @param {Object} pageMetaData - Global request pageMetaData object
 * @param {Object} object - object which contains page meta data for instance product/content
 */
function setPageMetaData(pageMetaData, object) {
    var title = '';

    if (object === null) {
        return;
    }

    if ('pageTitle' in object) {
        title = object.pageTitle;
    }

    if (!title && 'name' in object) {
        title = object.name;
    } else if (!title && 'productName' in object) {
        title = object.productName;
    }

    pageMetaData.setTitle(title);

    if ('pageDescription' in object && object.pageDescription) {
        pageMetaData.setDescription(object.pageDescription);
    }

    if ('pageKeywords' in object && object.pageKeywords) {
        pageMetaData.setKeywords(object.pageKeywords);
    }
}

/**
 * Set page meta tags to support rule based meta data
 *
 * @param {Object} pageMetaData - Global request pageMetaData object
 * @param {Object} object - object which contains page meta tags
 */
function setPageMetaTags(pageMetaData, object) {
    if (object === null) {
        return;
    }

    if ('pageMetaTags' in object) {
        pageMetaData.addPageMetaTags(object.pageMetaTags);
    }
}

/**
 * Middleware to compute request pageMetaData object
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {Function} next - Next call in the middleware chain
 * @returns {void}
 */
function computedPageMetaData(req, res, next) {
    var computedMetaData = {
        title: req.pageMetaData.title,
        description: req.pageMetaData.description,
        keywords: req.pageMetaData.keywords,
        pageMetaTags: []
    };

    req.pageMetaData.pageMetaTags.forEach(function (item) {
        if (item.title) {
            computedMetaData.title = item.title;
        } else if (item.name && item.ID === 'description') {
            computedMetaData.description = item.content;
        } else if (item.name && item.ID === 'keywords') {
            computedMetaData.keywords = item.content;
        } else {
            computedMetaData.pageMetaTags.push(item);
        }
    });

    res.setViewData({
        CurrentPageMetaData: computedMetaData
    });
    next();
}

module.exports = {
    computedPageMetaData: computedPageMetaData,
    setPageMetaData: setPageMetaData,
    setPageMetaTags: setPageMetaTags
};