
exports.get = function getComponentSettings(componentId) {
    const CacheMgr = require('dw/system/CacheMgr');
    const cache = CacheMgr.getCache('ComponentSettings');
    return cache.get(componentId || 'default', () => {
        const ContentMgr = require('dw/content/ContentMgr');
        const File = require('dw/io/File');
        const FileReader = require('dw/io/FileReader');
        let libId = ContentMgr.getSiteLibrary().ID;
        if (libId === 'Library') {
            const Site = require('dw/system/Site');
            libId = Site.current.ID;
        }
        let file;
        if (componentId) {
            const path = `${File.LIBRARIES}/${libId}/default/experience/settings/components/${componentId}.json`;
            file = new File(path);
        } else {
            file = new File(`${File.LIBRARIES}/${libId}/default/experience/settings/components/`).listFiles((subFile) => subFile.isFile()).toArray(0, 1).pop();
        }

        const reader = new FileReader(file, 'UTF-8');
        return JSON.parse(reader.readString());
    });
};
