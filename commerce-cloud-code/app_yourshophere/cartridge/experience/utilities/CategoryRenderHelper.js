'use strict';

var PD_CATEGORY_LANDING_PAGE = 'clp-';
var PD_CATEGORY_LISTING_PAGE = 'plp-';

module.exports = {
    /**
     * Returns the Page associated with the given category
     * @param {string} cgid - Category ID
     * @returns {dw.experience.Page} page The page object
     */
    getCategoryRelatedPage: function (cgid) {
        var PageMgr = require('dw/experience/PageMgr');
        var CatalogMgr = require('dw/catalog/CatalogMgr');
        var page = PageMgr.getPage(PD_CATEGORY_LANDING_PAGE + cgid);
        var category;

        // Get a category landing page from PD
        if (page && page.isVisible()) {
            return page;
        }
        // Get a category listing page from PD or its ancestor
        page = PageMgr.getPage(PD_CATEGORY_LISTING_PAGE + cgid);
        if (page && page.isVisible()) {
            return page;
        }
        category = CatalogMgr.getCategory(cgid);
        if (category && !category.isTopLevel()) {
            category = category.getParent();
            while (!page && category) {
                page = PageMgr.getPage(PD_CATEGORY_LISTING_PAGE + category.getID());
                category = category.getParent();
            }
        }
        return page || null;
    },

    /**
     * @param {dw.web.HttpParameterMap} httpParameterMap - Request HttpParameterMap;
     * @returns {string} categoryId
     */
    getCategoryFromPageId: function (httpParameterMap) {
        var params;
        var componentConfig;
        var PageRenderHelper = require('*/cartridge/experience/utilities/PageRenderHelper.js');
        if (PageRenderHelper.isInEditMode()) {
            return httpParameterMap.cid.value.split(PD_CATEGORY_LISTING_PAGE)[1];
        }
        try {
            params = JSON.parse(httpParameterMap.params);
            componentConfig = JSON.parse(params.custom);
            return componentConfig.cgid;
        } catch (e) {
            var Logger = require('*/api/Logger');
            Logger.error('Unable to parse parameters: ' + httpParameterMap.params);
        }
        return null;
    }

};
