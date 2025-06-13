'use strict';

var Template = require('dw/util/Template');
var HashMap = require('dw/util/HashMap');
var URLUtils = require('dw/web/URLUtils');
var ImageTransformation = require('~/cartridge/experience/utilities/ImageTransformation.js');

// eslint-disable-next-line valid-jsdoc
/**
 * Render logic for the assets.categorytile.
 */
exports.render = function render (context) {
    try {
        return renderComponent (context)
    } catch (e) {
        const Logger = require('*/api/Logger');
        Logger.error(`Exception on rendering page designer component: ${e.message} at '${e.fileName}:${e.lineNumber}'`)
    }
}

function renderComponent (context) {
    var model = new HashMap();
    var content = context.content;
    var category = content.category;
    var searchDetailsParam = content.searchdetails;
    var searchDetails = JSON.parse(searchDetailsParam.value);
    /*
    * If no image url was provided, clicking the category tile will lead the user back to the home page.
    */
    if (category) {
        model.url = URLUtils.url('Search-Show', 'cgid', category.ID);
    } else {
        model.url = URLUtils.url('Search-Show', 'cgid', 'root');
    }
    if (searchDetails.srule) {
        model.url.append('srule', searchDetails.srule);
    }

    if (searchDetails.filterattribute && searchDetails.filtervalue) {
        model.url.append('prefn1', searchDetails.filterattribute);
        model.url.append('prefv1', searchDetails.filtervalue);
    }


    model.text_headline = content.text_headline;
    if (content.text_subline) {
        model.text_subline = content.text_subline;
    }
    model.text_alignment = content.text_alignment === 'Left' ? 'left' : 'center';

    if (content.image) {
        model.image = {
            src: {
                mobile: ImageTransformation.url(content.image, { device: 'mobile' }),
                desktop: ImageTransformation.url(content.image, { device: 'desktop' })
            },
            alt: content.image.file.getAlt(),
            focalPointX: (content.image.focalPoint.x * 100) + '%',
            focalPointY: (content.image.focalPoint.y * 100) + '%'
        };
    }

    return new Template('experience/components/assets/categorytile').render(model).text;
};
