// This code is based on: https://github.com/sfccplus/super-page-designer

const ContentMgr = require('dw/content/ContentMgr');
const Site = require('dw/system/Site');
const URLUtils = require('dw/web/URLUtils');

/**
 * Returns Images View URL
 * @returns {string} images view url
 */
function getImagesViewURL() {
    const controllerURL = URLUtils.url('PDUtils-GetDisUrl', 'libaryId', ContentMgr.getSiteLibrary().ID, 'imagePath', '').toString();
    return controllerURL;
}

module.exports.init = function (editor) {
    const viewImageURL = getImagesViewURL();
    editor.configuration.put('viewImageURL', viewImageURL);
    // hardcoded to JSON file in code. If you want you can overload it with a js module that reads a custom site preference
    const disOptions = require('*/cartridge/experience/editors/imagesManager/disOptions.json');
    let frontendBreakpoints = {};
    try {
        frontendBreakpoints = require('app_yourshophere/cartridge/experience/breakpoints.json');
    } catch (error) {
        const Logger = require('dw/system/Logger');
        Logger.error('Failed to load frontend breakpoints configuration', error);
    }

    editor.configuration.put('frontendBreakpoints', frontendBreakpoints);
    editor.configuration.put('disOptions', disOptions);

    const siteLibrary = ContentMgr.getSiteLibrary();
    const libraryUtils = require('*/cartridge/utils/libraryUtils');
    const folderId = libraryUtils.getSiteLibraryFolder();

    const imageUploaderURL = URLUtils.url(
        'PDUtils-ImageUpload',
        'libraryId',
        siteLibrary.ID,
        'folderId',
        folderId,
    ).toString();
    editor.configuration.put('imageUploaderURL', imageUploaderURL);

    const getLibraryFoldersURL = URLUtils.url(
        'PDUtils-GetLibraryFolders',
        'libraryId',
        siteLibrary.ID,
        'folderId',
        folderId,
    ).toString();
    editor.configuration.put('getLibraryFoldersURL', getLibraryFoldersURL);

    const getFolderImagesURL = URLUtils.url(
        'PDUtils-GetFolderImages',
        'libraryId',
        siteLibrary.ID,
        'folderId',
        folderId,
    ).toString();
    editor.configuration.put('getFolderImagesURL', getFolderImagesURL);
};

