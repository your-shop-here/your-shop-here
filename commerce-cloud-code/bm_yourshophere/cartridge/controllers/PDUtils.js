
/**
 * Stores a component configuration in a file, so we can read in the storefront
 */
const store = function store() {
    const File = require('dw/io/File');
    const FileWriter = require('dw/io/FileWriter');
    let libId = request.httpParameterMap.libId.stringValue;
    if (libId === 'Library') {
        libId = request.httpParameterMap.siteId.stringValue;
    }
    const path = `${File.LIBRARIES}/${libId}/default/experience/settings/components`;
    const folder = new File(path);
    folder.mkdirs();
    const componentId = request.httpParameterMap.componentId.stringValue;
    const file = new File(`${path}/${componentId}.json`);
    if (!file.exists()) {
        file.createNewFile();
    }
    const fileWriter = new FileWriter(file, 'UTF-8', false);
    const settingsValue = request.httpParameterMap.settings.stringValue || '';
    fileWriter.write(settingsValue);
    fileWriter.flush();
    fileWriter.close();
    response.writer.print('');
};
store.public = true;

exports.Store = store;

/**
 * Image Manager Controller endpoints
 * This code is based on: https://github.com/sfccplus/super-page-designer
 */

/**
 * Upload images for image manager editor
 */
function imageUpload() {
    const File = require('dw/io/File');

    const params = request.httpParameterMap;
    const libraryId = params.libraryId.value;
    const locale = params.locale.value;
    const uploadPath = params.uploadPath.value;

    const imagesFolder = [File.LIBRARIES, libraryId, locale].join('/');

    // Create folders in path if they don't exist
    const rootFolder = new File([imagesFolder, uploadPath].join('/'));
    if (!rootFolder.exists()) {
        rootFolder.mkdirs();
    }

    let fileRelPath;
    const files = params.processMultipart((field, contentType, fileName) => {
        fileRelPath = [uploadPath, fileName].join('/');

        return new File([imagesFolder, fileRelPath].join('/'));
    });

    if (files) {
        response.setContentType('application/json');
        response.setStatus(200);

        response.writer.print(JSON.stringify({ location: fileRelPath }));
    } else {
        response.setStatus(500);
    }
}
imageUpload.public = true;
exports.ImageUpload = imageUpload;

function getLibraryFolders() {
    const File = require('dw/io/File');

    const params = request.httpParameterMap;
    const folderId = params.folderId.value;

    const rootPath = [File.LIBRARIES, folderId].join('/');

    function getSubFolders(parentPath, folderName, depth) {
        const folderPath = [parentPath, folderName]
            .filter((pathElement) => !!pathElement)
            .join('/');

        const folderData = {
            id: folderPath,
            name: folderName,
        };

        if (depth === 0) return folderData;

        const folder = new File([rootPath, folderPath].join('/'));

        const subfolders = folder
            .listFiles((file) => file.isDirectory())
            .toArray();

        if (subfolders.length) {
            folderData.children = subfolders.map((subfolder) => getSubFolders(folderPath, subfolder.name, depth - 1));
        }

        return folderData;
    }

    const result = getSubFolders('', '', 10);
    const subfolders = result && result.children ? result.children : [];

    // Create folders in path if they don't exist
    if (!subfolders.length) {
        const defaultPath = [File.LIBRARIES, libraryId, 'default'].join('/');
        const rootFolder = new File(defaultPath);
        if (!rootFolder.exists()) {
            rootFolder.mkdirs();
        }
    }

    response.setContentType('application/json');
    response.setStatus(200);
    response.writer.print(JSON.stringify(subfolders));
}
getLibraryFolders.public = true;
exports.GetLibraryFolders = getLibraryFolders;

function getFolderImages() {
    const File = require('dw/io/File');
    const URLUtils = require('dw/web/URLUtils');
    const params = request.httpParameterMap;

    const folderId = params.folderId.value;
    const folderPath = params.folderPath.value;

    const folderAbsolutePath = [File.LIBRARIES, folderId, folderPath].join('/');

    const folder = new File(folderAbsolutePath);
    const files = folder
        .listFiles((file) => !file.isDirectory())
        .toArray();

    const ContentMgr = require('dw/content/ContentMgr');
    const siteLibrary = ContentMgr.getSiteLibrary();

    if (!siteLibrary) {
        response.setStatus(500);
        response.writer.print(JSON.stringify({ error: 'Site library not found' }));
        return;
    }

    const images = files.map((file) => {
        const filePath = file.getFullPath();
        const pathComponents = filePath.split('/');

        // Remove the first component (library root)
        pathComponents.shift();

        let imagePath = pathComponents.join('/');
        imagePath = imagePath.replace(new RegExp(`LIBRARIES/${folderId}/default/`), '');
        const imageType = 'png,gif,jpeg,jpg,jp2,jxr,webp,avif'.split(',');
        let url;
        if (imageType.includes(file.name.split('.').pop() || '')) {
            url = URLUtils.imageURL(URLUtils.CONTEXT_LIBRARY, folderId, imagePath, {
                scaleWidth: 230,
            }).toString();
        } else {
            url = URLUtils.staticURL(URLUtils.CONTEXT_LIBRARY, folderId, imagePath).toString();
        }
        return {
            name: file.name,
            path: imagePath,
            url,
        };
    });

    response.setContentType('application/json');
    response.setStatus(200);
    response.writer.print(JSON.stringify(images));
}
getFolderImages.public = true;
exports.GetFolderImages = getFolderImages;
