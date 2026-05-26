const HashMap = require('dw/util/HashMap');

let imageSourceSet;

module.exports = function (object, content) {
    Object.defineProperty(object, 'imageContainer', {
        enumerable: true,
        value: (function () {
            // this should be the fastest way to require at B2C / once per
            imageSourceSet = imageSourceSet || require('*/cartridge/experience/utilities/imageSourceSet.js');
            const overlayTextClasses = [];
            const model = new HashMap();
            const colorMap = {
                Primary: '-primary',
                'Page Background': '-bgcolor',
                'Link Color': '-interation ',
                'Menu Background': '-menucolor',
            };
            model.heading = content.heading ? content.heading : '';
            model.ITCText = content.ITCText ? content.ITCText : '';

            model.image = imageSourceSet(content.image, 'content-images');

            model.link = content.link;
            model.ITCText = content.ITCText ? content.ITCText : '';
            model.link = content.ITCLink ? content.ITCLink : '#';
            model.alt = content.alt ? content.alt : '';

            if (content.textContrast === 'Drop Shadow') {
                overlayTextClasses.push('drop-shadow-contrast');
            }
            if (content.textContrast === 'Background Color') {
                overlayTextClasses.push(`bg${colorMap[content.textBackground]}`);
            }
            if (content.textColor && colorMap[content.textColor]) {
                overlayTextClasses.push(` fg${colorMap[content.textColor]}`);
            }
            if (content.textHAlign) {
                overlayTextClasses.push(`text-${content.textHAlign}`);
                model.containerHAlign = `halign-${content.textHAlign}`;
            } else {
                overlayTextClasses.push('text-center');
                model.containerHAlign = 'halign-center';
            }

            if (content.textVAlign) {
                model.verticalAlign = `valign-${content.textVAlign}`;
            } else {
                model.verticalAlign = 'valign-middle';
            }

            model.overlayTextClass = overlayTextClasses.join(' ');
            model.mainClass = (content.textContrast === 'Gradient') ? 'gradient-contrast' : '';

            return model;
        }()),
    });
};
