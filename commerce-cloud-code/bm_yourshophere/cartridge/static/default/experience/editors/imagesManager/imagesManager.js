/**
 * Images Manager Editor - Vanilla JavaScript implementation
 * This code is based on: https://github.com/sfccplus/super-page-designer
 */
(function () {
    let rootEditorElement;
    const state = {
        currentFolder: '',
        currentImage: null,
        cropData: null,
        quality: 100,
        editorPage: 'home', // 'home' or 'crop'
        folders: [],
        images: [],
    };
    let config = {};

    /**
     * Get final image URL with crop and quality parameters
     */
    function getFinalURL(imagePath, cropData, quality) {
        if (!imagePath) return '';

        let baseURL = config.viewImageURL + imagePath;

        if (cropData) {
            baseURL += `&cropX=${cropData.x.toFixed(3)}`;
            baseURL += `&cropY=${cropData.y.toFixed(3)}`;
            baseURL += `&cropWidth=${cropData.width.toFixed(3)}`;
            baseURL += `&cropHeight=${cropData.height.toFixed(3)}`;
        }

        if (quality && quality !== 100) {
            baseURL += `&quality=${quality}`;
        }

        return baseURL;
    }

    /**
     * Render folder tree
     */
    function renderFolderTree(folders, container) {
        if (!folders || folders.length === 0) {
            container.innerHTML = '<div class="slds-text-body_small slds-text-color_weak">No folders found</div>';
            return;
        }

        let html = '<ul class="slds-tree" role="tree">';

        function renderFolder(folder, level) {
            const indent = level * 20;
            const hasChildren = folder.children && folder.children.length > 0;
            const isSelected = state.currentFolder === folder.id ? 'slds-is-selected' : '';

            html += `<li role="treeitem" class="slds-tree__item ${isSelected}" data-folder-id="${folder.id}" style="padding-left: ${indent}px;">`;
            html += '<div class="slds-tree__item-meta">';
            html += '<span class="slds-icon_container slds-m-right_x-small">';
            if (hasChildren) {
                html += '<svg class="slds-icon slds-icon_x-small" aria-hidden="true"><use xlink:href="/assets/icons/utility-sprite/svg/symbols.svg#chevronright"></use></svg>';
            }
            html += '</span>';
            html += `<a href="#" class="slds-tree__item-label folder-link" data-folder-id="${folder.id}">${folder.name}</a>`;
            html += '</div>';

            if (hasChildren) {
                html += '<ul role="group" class="slds-tree" style="display: none;">';
                folder.children.forEach((child) => {
                    renderFolder(child, level + 1);
                });
                html += '</ul>';
            }

            html += '</li>';
        }

        folders.forEach((folder) => {
            renderFolder(folder, 0);
        });

        html += '</ul>';
        container.innerHTML = html;

        // Add event listeners
        container.querySelectorAll('.folder-link').forEach((link) => {
            link.addEventListener('click', function (e) {
                e.preventDefault();
                const folderId = this.getAttribute('data-folder-id');
                selectFolder(folderId);
            });
        });
    }

    /**
     * Select a folder
     */
    function selectFolder(folderId) {
        state.currentFolder = folderId;

        // Update UI
        rootEditorElement.querySelectorAll('.slds-tree__item').forEach((item) => {
            item.classList.remove('slds-is-selected');
        });
        const selectedItem = rootEditorElement.querySelector(`[data-folder-id="${folderId}"]`);
        if (selectedItem) {
            selectedItem.classList.add('slds-is-selected');
        }

        // Load images for this folder
        loadFolderImages(folderId);
    }

    /**
     * Load folder images
     */
    function loadFolderImages(folderPath) {
        const imagesContainer = rootEditorElement.querySelector('.images-list-container');
        imagesContainer.innerHTML = '<div class="slds-spinner_container"><div class="slds-spinner slds-spinner_medium" role="status"><span class="slds-assistive-text">Loading</span><div class="slds-spinner__dot-a"></div><div class="slds-spinner__dot-b"></div></div></div>';

        const url = `${config.getFolderImagesURL}&folderPath=${encodeURIComponent(folderPath)}&locale=${encodeURIComponent(config.locale || 'default')}`;

        fetch(url)
            .then((response) => response.json())
            .then((images) => {
                state.images = images;
                renderImages(images);
            })
            .catch((error) => {
                console.error('Error loading images:', error);
                imagesContainer.innerHTML = '<div class="slds-text-body_small slds-text-color_error">Error loading images</div>';
            });
    }

    /**
     * Render images list
     */
    function renderImages(images) {
        const container = rootEditorElement.querySelector('.images-list-container');

        if (!images || images.length === 0) {
            container.innerHTML = '<div class="slds-text-body_small slds-text-color_weak">No images in this folder</div>';
            return;
        }

        let html = '<div class="slds-grid slds-grid_pull-padded slds-wrap" style="gap: 0.5rem;">';

        images.forEach((image) => {
            html += '<div class="slds-col slds-size_1-of-4" style="cursor: pointer;">';
            html += `<div class="image-thumbnail" data-image-path="${image.path}" style="width: 100%; height: 150px; background-image: url('${image.url}'); background-size: cover; background-position: center; border: 2px solid transparent; border-radius: 4px;"></div>`;
            html += `<div class="slds-text-body_small slds-m-top_x-small" style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${image.name}</div>`;
            html += '</div>';
        });

        html += '</div>';
        container.innerHTML = html;

        // Add click handlers
        container.querySelectorAll('.image-thumbnail').forEach((thumb) => {
            thumb.addEventListener('click', function () {
                const imagePath = this.getAttribute('data-image-path');
                selectImage(imagePath);
            });
        });

        document.body.style.height = `${document.querySelector('.right-panel .slds-grid').getBoundingClientRect().height + 100}px`;
    }

    /**
     * Select an image
     */
    function selectImage(imagePath) {
        state.currentImage = imagePath;
        state.cropData = null;
        state.editorPage = 'home';
        showImageEditor();
    }

    /**
     * Show image editor
     */
    function showImageEditor() {
        if (!state.currentImage) return;

        const editorContainer = rootEditorElement.querySelector('.image-editor-container');
        editorContainer.style.display = 'block';

        updateImagePreview();

        // Trigger resize when editor is shown (content height changes)
        setTimeout(triggerResize, 100);
    }

    /**
     * Update image preview
     */
    function updateImagePreview() {
        if (!state.currentImage) return;

        const previewContainer = rootEditorElement.querySelector('.image-preview');
        const finalURL = getFinalURL(state.currentImage, state.cropData, state.quality);

        if (state.editorPage === 'crop') {
            // Show crop interface
            previewContainer.innerHTML = `<div class="crop-container" style="position: relative; width: 100%; height: 100%; background-image: url('${config.viewImageURL}${state.currentImage}'); background-size: contain; background-repeat: no-repeat; background-position: center;"></div>`;
        } else {
            // Show preview
            previewContainer.style.backgroundImage = `url("${finalURL}")`;
        }
    }

    /**
     * Handle quality change
     */
    function handleQualityChange(value) {
        state.quality = parseInt(value, 10);
        updateImagePreview();
        notifyValueChange();
    }

    /**
     * Apply crop
     */
    function applyCrop() {
        // Simplified crop - in a real implementation, you'd use canvas API
        state.editorPage = 'home';
        updateImagePreview();
        notifyValueChange();
    }

    /**
     * Cancel crop
     */
    function cancelCrop() {
        state.editorPage = 'home';
        updateImagePreview();
    }

    /**
     * Notify value change
     */
    function notifyValueChange() {
        if (!state.currentImage) return;

        const finalURL = getFinalURL(state.currentImage, state.cropData, state.quality);

        emit({
            type: 'sfcc:value',
            payload: { value: finalURL },
        });
    }

    /**
     * Handle image upload
     */
    function handleImageUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        // Build upload URL with parameters
        let uploadURL = config.imageUploaderURL;
        if (config.locale) {
            uploadURL += `${uploadURL.indexOf('?') === -1 ? '?' : '&'}locale=${encodeURIComponent(config.locale)}`;
        }
        if (state.currentFolder) {
            uploadURL += `${uploadURL.indexOf('?') === -1 ? '?' : '&'}uploadPath=${encodeURIComponent(state.currentFolder)}`;
        }

        const uploadBtn = rootEditorElement.querySelector('.upload-btn');
        uploadBtn.disabled = true;
        uploadBtn.textContent = 'Uploading...';

        fetch(uploadURL, {
            method: 'POST',
            body: formData,
        })
            .then((response) => response.json())
            .then((data) => {
            // Reload images
                loadFolderImages(state.currentFolder);
                uploadBtn.disabled = false;
                uploadBtn.textContent = 'Upload Image';
                event.target.value = ''; // Reset file input
            })
            .catch((error) => {
                console.error('Error uploading image:', error);
                uploadBtn.disabled = false;
                uploadBtn.textContent = 'Upload Image';
            });
    }

    /**
     * Initialize the editor markup
     */
    function init() {
        rootEditorElement = document.createElement('div');
        rootEditorElement.style.cssText = 'position: absolute; top: 0; left: 0; right: 0; bottom: 0; width: 100%; height: 100%; min-height: 500px';
        rootEditorElement.innerHTML = `
            <div class="images-manager-container" style="display: flex; width: 100%; height: 100%; min-height: 500px;">
                <!-- Left Panel -->
                <div class="left-panel" style="width: 250px; min-width: 250px; border-right: 1px solid #dddbda; padding: 1rem; overflow-y: auto; background-color: #fafaf9;">
                    <div class="upload-container" style="margin-bottom: 1rem;">
                        <label class="slds-button slds-button_neutral slds-button_stretch upload-btn" style="cursor: pointer;">
                            <i class="fas fa-upload slds-button__icon"></i> Upload Image
                            <input type="file" accept="image/*" style="display: none;" class="file-input">
                        </label>
                    </div>
                    <div class="folders-container" style="min-height: 200px;">
                        <div class="slds-text-body_small slds-text-color_weak" style="text-align: center; padding: 1rem;">
                            Loading folders...
                        </div>
                    </div>
                </div>

                <!-- Right Panel -->
                <div class="right-panel" style="flex: 1; display: flex; flex-direction: column; min-width: 0; background-color: #ffffff;">
                    <div class="images-list-container" style="flex: 1; padding: 1rem; overflow-y: auto; min-height: 0;">
                        <div class="slds-text-body_small slds-text-color_weak" style="text-align: center; padding: 2rem;">
                            Select a folder from the left to view images
                        </div>
                    </div>
                    
                    <!-- Image Editor -->
                    <div class="image-editor-container" style="display: none; border-top: 1px solid #dddbda; padding: 1rem; background-color: #ffffff;">
                        <div class="slds-grid slds-grid_align-spread slds-m-bottom_medium">
                            <div class="slds-col">
                                <h3 class="slds-text-heading_small">Image Editor</h3>
                            </div>
                            <div class="slds-col">
                                <button class="slds-button slds-button_neutral close-editor-btn">Close</button>
                            </div>
                        </div>
                        
                        <div class="slds-grid">
                            <div class="slds-col slds-size_2-of-3">
                                <div class="image-preview" style="width: 100%; height: 400px; border: 1px solid #dddbda; background-size: contain; background-position: center; background-repeat: no-repeat; background-color: #f3f2f2;"></div>
                            </div>
                            <div class="slds-col slds-size_1-of-3" style="padding-left: 1rem;">
                                <div class="slds-form-element">
                                    <label class="slds-form-element__label">Quality</label>
                                    <div class="slds-form-element__control">
                                        <input type="range" min="1" max="100" value="100" class="quality-slider slds-slider" style="width: 100%;">
                                        <div class="slds-form-element__help" style="text-align: center; margin-top: 0.5rem;">
                                            <span class="quality-value">100</span>%
                                        </div>
                                    </div>
                                </div>
                                <div class="slds-m-top_medium">
                                    <button class="slds-button slds-button_brand apply-btn">Apply</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(rootEditorElement);
        document.body.style.minHeight = '500px';

        // Set up event listeners
        rootEditorElement.querySelector('.file-input').addEventListener('change', handleImageUpload);
        rootEditorElement.querySelector('.quality-slider').addEventListener('input', (e) => {
            rootEditorElement.querySelector('.quality-value').textContent = e.target.value;
            handleQualityChange(e.target.value);
        });
        rootEditorElement.querySelector('.apply-btn').addEventListener('click', () => {
            if (state.currentImage) {
                const finalURL = getFinalURL(state.currentImage, state.cropData, state.quality);
                // Emit breakout apply event for breakout editor communication
                emit({
                    type: 'sfcc:breakoutApply',
                    value: { value: finalURL },
                });
            }
        });
        rootEditorElement.querySelector('.close-editor-btn').addEventListener('click', () => {
            rootEditorElement.querySelector('.image-editor-container').style.display = 'none';
        });
    }

    /**
     * Load library folders
     */
    function loadLibraryFolders() {
        fetch(config.getLibraryFoldersURL)
            .then((response) => response.json())
            .then((folders) => {
                state.folders = folders;
                const container = rootEditorElement.querySelector('.folders-container');
                renderFolderTree(folders, container);

                // Select first folder if available
                if (folders && folders.length > 0) {
                    selectFolder(folders[0].id);
                }
            })
            .catch((error) => {
                console.error('Error loading folders:', error);
                // Trigger resize even on error to show error message
            });
    }

    // Listen for SFCC ready event
    listen('sfcc:ready', (data) => {
        config = data.config || {};

        // Store config globally for breakout editors
        window.EditorsContext = {
            urls: {
                getLibraryFoldersURL: config.getLibraryFoldersURL,
                getFolderImagesURL: config.getFolderImagesURL,
                viewImageURL: config.viewImageURL,
                imageUploaderURL: config.imageUploaderURL,
            },
        };

        // Load folders
        loadLibraryFolders();
    });

    // Initialize
    init();
}());

