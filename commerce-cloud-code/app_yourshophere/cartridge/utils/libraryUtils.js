/**
 * Utility functions for working with site libraries
 */

/**
 * Gets the site library folder ID, handling platform oddity where
 * ContentMgr.getSiteLibrary().ID may return 'Library' instead of the actual site ID
 *
 * @returns {string} The actual site library folder ID
 */
function getSiteLibraryFolder() {
    const ContentMgr = require('dw/content/ContentMgr');
    let libId = ContentMgr.getSiteLibrary().ID;

    if (libId === 'Library') {
        const Site = require('dw/system/Site');
        libId = Site.current.ID;
    }

    return libId;
}

module.exports = {
    getSiteLibraryFolder,
};

