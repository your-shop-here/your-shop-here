/**
 * Images Manager Editor - Vanilla JavaScript implementation
 * This code is based on: https://github.com/sfccplus/super-page-designer
 */
(function () {
    let rootEditorElement;
    const state = {
        currentFolder: '',
        currentImage: null,
        crops: [], // Array of crop objects: [{aspectRatio: {w: 1, h: 1}, topLeft: {x: 10, y: 0}, size: {width: 50, height: 50}, type: "default"}, ...]
        quality: 100,
        editorPage: 'home', // 'home' or 'crop'
        folders: [],
        images: [],
        editingCropType: null, // 'default', 'tablet', 'desktop' - which crop is currently being edited
        cropDisplayType: 'Default', // 'Default', 'Tablet', 'Desktop' - selected in dropdown
        cropAspectRatio: '1:1', // Current aspect ratio selection for editing (e.g., '1:1', '16:9', etc.)
        cropAspectType: 'fixed', // 'fixed' or 'free' - whether aspect ratio is constrained
        cropRectangle: null, // { x, y, width, height } in percentage - current editing rectangle
    };
    let config = {};
    let cropOverlays = {}; // Object with keys: 'default', 'tablet', 'desktop' - stores overlay elements
    let activeOverlay = null; // Currently active/editable overlay
    let isDragging = false;
    let isResizing = false;
    let dragStartX = 0;
    let dragStartY = 0;
    let cropStartRect = null;
    let mouseMoveHandler = null;
    let mouseUpHandler = null;
    let mouseDownHandler = null;

    // Color mapping for crop types
    const cropColors = {
        default: { border: '#0070d2', background: 'rgba(0, 112, 210, 0.1)' }, // Blue
        tablet: { border: '#04844b', background: 'rgba(4, 132, 75, 0.1)' }, // Green
        desktop: { border: '#c23934', background: 'rgba(194, 57, 52, 0.1)' }, // Red
    };

    /**
     * Get image dimensions from URL
     * @param {string} url - The image URL
     * @returns {Promise<Object>} Promise that resolves to {width: number, height: number}
     */
    function getImageDimensions(url) {
        return new Promise((resolve, reject) => {
            if (!url) {
                reject(new Error('URL is required'));
                return;
            }

            const img = new Image();
            img.onload = function () {
                resolve({
                    width: img.naturalWidth || img.width,
                    height: img.naturalHeight || img.height,
                });
            };
            img.onerror = function () {
                reject(new Error('Failed to load image'));
            };
            img.src = url;
        });
    }

    /**
     * Get final image URL with crop and quality parameters
     * @param {string} imagePath - The image path
     * @param {Array} crops - Array of crop objects
     * @param {number} quality - The quality
     * @param {string} displayType - The display type to use ('default', 'tablet', 'desktop')
     * @returns {string} The final image URL
     */
    async function updateImageURLs(imagePath, crops, quality, displayType) {
        if (!imagePath) return '';

        let baseURL = config.viewImageURL + imagePath;
        // Find crop for the requested display type, fallback to default
        const typeMap = { Default: 'default', Tablet: 'tablet', Desktop: 'desktop' };
        const type = typeMap[displayType] || 'default';

        /*
        let activeCrop = null;
        if (crops && Array.isArray(crops)) {
            activeCrop = crops.find((c) => c.type === type) || crops.find((c) => c.type === 'default');
        }
        if (activeCrop) {
            baseURL += `&cropX=${activeCrop.topLeft.x.toFixed(3)}`;
            baseURL += `&cropY=${activeCrop.topLeft.y.toFixed(3)}`;
            baseURL += `&cropWidth=${activeCrop.size.width.toFixed(3)}`;
            baseURL += `&cropHeight=${activeCrop.size.height.toFixed(3)}`;
        }
*/
        if (quality && quality !== 100) {
            baseURL += `&quality=${quality}`;
        }
        const response = await fetch(baseURL);
        const data = await response.json();

        state.currentImageDimensions = await getImageDimensions(data.originalFileUrl);

        return data.url;
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
        const imagesListContainer = rootEditorElement.querySelector('.images-list-container');

        // Hide image list and show editor
        imagesListContainer.style.display = 'none';
        editorContainer.style.display = 'flex';
        editorContainer.style.flexDirection = 'column';
        editorContainer.style.flex = '1';

        updateImagePreview();
    }

    /**
     * Hide image editor and show image list
     */
    function hideImageEditor() {
        const editorContainer = rootEditorElement.querySelector('.image-editor-container');
        const imagesListContainer = rootEditorElement.querySelector('.images-list-container');

        // Hide editor and show image list
        editorContainer.style.display = 'none';
        imagesListContainer.style.display = 'flex';
        imagesListContainer.style.flexDirection = 'column';
        imagesListContainer.style.flex = '1';

        // Reset crop editing state (but keep crops)
        state.currentImage = null;
        state.editingCropType = null;
        state.cropRectangle = null;
        activeOverlay = null;
        cropOverlays = {};
    }

    /**
     * Calculate aspect ratio from string
     */
    function getAspectRatioValue(ratio) {
        if (!ratio) return null;
        const [w, h] = ratio.split(':').map(Number);
        return w / h;
    }

    /**
     * Save/update crop in the crops array - called automatically on changes
     */
    function saveCropToArray() {
        if (!state.editingCropType || !state.cropRectangle) {
            return;
        }

        // Parse aspect ratio (handle "Free" mode)
        let aspectRatio = { w: 1, h: 1 }; // Default to 1:1
        if (state.cropAspectType === 'fixed' && state.cropAspectRatio) {
            const [w, h] = state.cropAspectRatio.split(':').map(Number);
            aspectRatio = { w, h };
        }

        // Create crop object
        const crop = {
            aspectRatio,
            topLeft: {
                x: state.cropRectangle.x,
                y: state.cropRectangle.y,
            },
            size: {
                width: state.cropRectangle.width,
                height: state.cropRectangle.height,
            },
            cropWidthPercent: state.cropRectangle.width, // Width percentage of the crop rectangle
            type: state.editingCropType,
        };

        // Ensure crops array exists
        if (!state.crops || !Array.isArray(state.crops)) {
            state.crops = [];
        }

        // Remove existing crop of this type if any
        state.crops = state.crops.filter((c) => c && c.type !== state.editingCropType);

        // Add new crop
        state.crops.push(crop);

        // Update UI
        updateTabUI(state.editingCropType);
        updateTabTitles();
    }

    /**
     * Update crop rectangle based on aspect ratio - spans longest direction
     */
    function updateCropRectangleForAspectRatio() {
        if (!state.cropRectangle) return;

        // If in free mode, don't enforce aspect ratio
        if (state.cropAspectType === 'free') {
            renderEditingRectangle();
            return;
        }

        const aspectRatio = getAspectRatioValue(state.cropAspectRatio);
        if (!aspectRatio) return;

        const previewContainer = rootEditorElement.querySelector('.image-preview');
        const containerRect = previewContainer.getBoundingClientRect();
        const containerAspect = containerRect.width / containerRect.height;

        // Calculate maximum size that fits in container with the aspect ratio
        let maxWidth;
        let maxHeight;
        if (containerAspect > aspectRatio) {
            // Container is wider, constrain by height (span full height)
            maxHeight = 100;
            maxWidth = (maxHeight * aspectRatio) * (containerRect.height / containerRect.width);
        } else {
            // Container is taller, constrain by width (span full width)
            maxWidth = 100;
            maxHeight = (maxWidth / aspectRatio) * (containerRect.width / containerRect.height);
        }

        // Center the rectangle
        const centerX = state.cropRectangle.x + (state.cropRectangle.width / 2);
        const centerY = state.cropRectangle.y + (state.cropRectangle.height / 2);

        // Update to span longest direction while maintaining aspect ratio
        state.cropRectangle.width = Math.min(100, maxWidth);
        state.cropRectangle.height = Math.min(100, maxHeight);

        // Re-center
        state.cropRectangle.x = Math.max(0, Math.min(100 - state.cropRectangle.width, centerX - (state.cropRectangle.width / 2)));
        state.cropRectangle.y = Math.max(0, Math.min(100 - state.cropRectangle.height, centerY - (state.cropRectangle.height / 2)));

        renderEditingRectangle();
        // Auto-save crop when aspect ratio changes
        saveCropToArray();
    }

    /**
     * Render all crop overlays
     */
    function renderAllCropOverlays() {
        const previewContainer = rootEditorElement.querySelector('.image-preview');
        if (!previewContainer) return;

        previewContainer.style.position = 'relative';

        // Remove all existing overlays (both saved crops and editing overlay)
        Object.values(cropOverlays).forEach((overlay) => {
            if (overlay && overlay.parentNode) {
                overlay.parentNode.removeChild(overlay);
            }
        });
        cropOverlays = {};

        // Also remove any editing overlay
        if (activeOverlay && activeOverlay.parentNode) {
            activeOverlay.parentNode.removeChild(activeOverlay);
            activeOverlay = null;
        }

        // Remove any editing overlays that might still be in the DOM
        const existingEditingOverlays = previewContainer.querySelectorAll('.editing-overlay');
        existingEditingOverlays.forEach((overlay) => {
            if (overlay.parentNode) {
                overlay.parentNode.removeChild(overlay);
            }
        });

        const containerRect = previewContainer.getBoundingClientRect();

        // Render all crops (but skip the one being edited - it will be shown as editing overlay)
        state.crops.forEach((crop) => {
            // Skip rendering saved crop if it's currently being edited
            if (crop.type === state.editingCropType) {
                return;
            }

            const overlay = document.createElement('div');
            overlay.className = `crop-overlay crop-overlay-${crop.type}`;
            const colors = cropColors[crop.type] || cropColors.default;

            overlay.style.cssText = `
                position: absolute;
                border: 2px solid ${colors.border};
                background: ${colors.background};
                cursor: pointer;
                box-sizing: border-box;
                z-index: 5;
            `;

            // Calculate position and size
            const x = (crop.topLeft.x / 100) * containerRect.width;
            const y = (crop.topLeft.y / 100) * containerRect.height;
            const width = (crop.size.width / 100) * containerRect.width;
            const height = (crop.size.height / 100) * containerRect.height;

            overlay.style.left = `${x}px`;
            overlay.style.top = `${y}px`;
            overlay.style.width = `${width}px`;
            overlay.style.height = `${height}px`;

            // Click handler to select crop for editing
            overlay.addEventListener('click', () => {
                selectCropForEditing(crop.type);
            });

            previewContainer.appendChild(overlay);
            cropOverlays[crop.type] = overlay;
        });

        // Render editing rectangle if active (this replaces the saved crop overlay for the editing crop)
        if (state.cropRectangle && state.editingCropType) {
            renderEditingRectangle();
        }
    }

    /**
     * Render the currently editing rectangle (temporary, not yet saved)
     */
    function renderEditingRectangle() {
        if (!state.cropRectangle || !state.editingCropType) return;

        const previewContainer = rootEditorElement.querySelector('.image-preview');
        if (!previewContainer) return;

        const containerRect = previewContainer.getBoundingClientRect();
        const colors = cropColors[state.editingCropType] || cropColors.default;

        // Remove existing editing overlay if any
        if (activeOverlay && activeOverlay.classList.contains('editing-overlay')) {
            if (activeOverlay.parentNode) {
                activeOverlay.parentNode.removeChild(activeOverlay);
            }
            activeOverlay = null;
        }

        // Also remove any editing overlays that might still be in the DOM
        const existingEditingOverlays = previewContainer.querySelectorAll('.editing-overlay');
        existingEditingOverlays.forEach((overlay) => {
            if (overlay.parentNode) {
                overlay.parentNode.removeChild(overlay);
            }
        });

        const overlay = document.createElement('div');
        overlay.className = 'crop-overlay editing-overlay';
        overlay.style.cssText = `
            position: absolute;
            border: 2px dashed ${colors.border};
            background: ${colors.background};
            cursor: move;
            box-sizing: border-box;
            z-index: 15;
        `;

        const x = (state.cropRectangle.x / 100) * containerRect.width;
        const y = (state.cropRectangle.y / 100) * containerRect.height;
        const width = (state.cropRectangle.width / 100) * containerRect.width;
        const height = (state.cropRectangle.height / 100) * containerRect.height;

        overlay.style.left = `${x}px`;
        overlay.style.top = `${y}px`;
        overlay.style.width = `${width}px`;
        overlay.style.height = `${height}px`;

        // Add resize handles
        const handles = ['nw', 'ne', 'sw', 'se', 'n', 's', 'e', 'w'];
        handles.forEach((handle) => {
            let cursorType = 'ew-resize';
            if (handle === 'nw' || handle === 'se') {
                cursorType = 'nwse-resize';
            } else if (handle === 'ne' || handle === 'sw') {
                cursorType = 'nesw-resize';
            } else if (handle === 'n' || handle === 's') {
                cursorType = 'ns-resize';
            }

            const handleEl = document.createElement('div');
            handleEl.className = `crop-handle crop-handle-${handle}`;
            handleEl.style.cssText = `
                position: absolute;
                width: 10px;
                height: 10px;
                background: ${colors.border};
                border: 1px solid #fff;
                ${handle.includes('n') ? 'top: -5px;' : ''}
                ${handle.includes('s') ? 'bottom: -5px;' : ''}
                ${handle.includes('w') ? 'left: -5px;' : ''}
                ${handle.includes('e') ? 'right: -5px;' : ''}
                ${handle === 'n' || handle === 's' ? 'left: 50%; transform: translateX(-50%);' : ''}
                ${handle === 'e' || handle === 'w' ? 'top: 50%; transform: translateY(-50%);' : ''}
                cursor: ${cursorType};
            `;
            handleEl.addEventListener('mousedown', (e) => {
                e.stopPropagation();
                isResizing = true;
                dragStartX = e.clientX;
                dragStartY = e.clientY;
                cropStartRect = { ...state.cropRectangle };
            });
            overlay.appendChild(handleEl);
        });

        previewContainer.appendChild(overlay);
        activeOverlay = overlay;
    }

    /**
     * Handle mouse move for dragging/resizing
     */
    function handleMouseMove(e) {
        if (!state.editingCropType || !state.cropRectangle) return;

        const previewContainerEl = rootEditorElement.querySelector('.image-preview');
        if (!previewContainerEl) return;

        const containerRect = previewContainerEl.getBoundingClientRect();
        const deltaX = ((e.clientX - dragStartX) / containerRect.width) * 100;
        const deltaY = ((e.clientY - dragStartY) / containerRect.height) * 100;

        if (isDragging && cropStartRect) {
            let newX = cropStartRect.x + deltaX;
            let newY = cropStartRect.y + deltaY;

            // Constrain to bounds
            newX = Math.max(0, Math.min(100 - state.cropRectangle.width, newX));
            newY = Math.max(0, Math.min(100 - state.cropRectangle.height, newY));

            state.cropRectangle.x = newX;
            state.cropRectangle.y = newY;
            renderEditingRectangle();
            // Auto-save crop on drag
            saveCropToArray();
        } else if (isResizing && cropStartRect) {
            // Handle resizing
            let newWidth = cropStartRect.width + deltaX;
            let newHeight = cropStartRect.height + deltaY;

            if (state.cropAspectType === 'fixed' && state.cropAspectRatio) {
                // Maintain aspect ratio
                const aspectRatio = getAspectRatioValue(state.cropAspectRatio);
                const containerAspect = containerRect.width / containerRect.height;
                if (Math.abs(deltaX) > Math.abs(deltaY)) {
                    newWidth = Math.max(10, Math.min(100 - cropStartRect.x, newWidth));
                    newHeight = (newWidth / aspectRatio) * containerAspect;
                } else {
                    newHeight = Math.max(10, Math.min(100 - cropStartRect.y, newHeight));
                    newWidth = (newHeight * aspectRatio) / containerAspect;
                }
            } else {
                // Free mode - allow independent width/height changes
                newWidth = Math.max(10, Math.min(100 - cropStartRect.x, newWidth));
                newHeight = Math.max(10, Math.min(100 - cropStartRect.y, newHeight));
            }

            state.cropRectangle.width = newWidth;
            state.cropRectangle.height = newHeight;
            renderEditingRectangle();
            // Auto-save crop on resize
            saveCropToArray();
        }
    }

    /**
     * Handle mouse up for stopping drag/resize
     */
    function handleMouseUp() {
        if (isDragging || isResizing) {
            // Re-render overlays after drag/resize ends to ensure clean state
            updateImagePreview();
        }
        isDragging = false;
        isResizing = false;
        cropStartRect = null;
    }

    /**
     * Initialize crop overlay with mouse events
     */
    function initCropOverlay() {
        // Remove existing mouse down handler if any
        if (activeOverlay && mouseDownHandler) {
            activeOverlay.removeEventListener('mousedown', mouseDownHandler);
        }

        // Mouse down on active overlay - start dragging
        if (activeOverlay) {
            mouseDownHandler = (e) => {
                if (e.target.classList.contains('crop-handle')) return;
                if (!state.cropRectangle) return;
                isDragging = true;
                dragStartX = e.clientX;
                dragStartY = e.clientY;
                cropStartRect = { ...state.cropRectangle };
            };
            activeOverlay.addEventListener('mousedown', mouseDownHandler);
        }

        // Add mouse move and mouse up listeners only once
        if (!mouseMoveHandler) {
            mouseMoveHandler = handleMouseMove;
            document.addEventListener('mousemove', mouseMoveHandler);
        }
        if (!mouseUpHandler) {
            mouseUpHandler = handleMouseUp;
            document.addEventListener('mouseup', mouseUpHandler);
        }
    }

    /**
     * Update image preview
     */
    async function updateImagePreview() {
        if (!state.currentImage) return;

        const previewContainer = rootEditorElement.querySelector('.image-preview');
        const typeMap = { Default: 'default', Tablet: 'tablet', Desktop: 'desktop' };
        const displayType = typeMap[state.cropDisplayType] || 'default';
        const previewUrl = await updateImageURLs(state.currentImage, state.crops, state.quality, displayType);

        // Always show the preview image as background
        previewContainer.style.backgroundImage = `url("${previewUrl}")`;
        previewContainer.style.backgroundSize = 'contain';
        previewContainer.style.backgroundPosition = 'center';
        previewContainer.style.backgroundRepeat = 'no-repeat';

        // Render all crop overlays
        setTimeout(() => {
            renderAllCropOverlays();
            if (state.editingCropType && state.cropRectangle) {
                initCropOverlay();
            }
            updateTabTitles();
        }, 100);
    }

    /**
     * Handle quality change
     */
    function handleQualityChange(value) {
        state.quality = parseInt(value, 10);
        updateImagePreview();
    }

    /**
     * Update tab titles with checkmarks
     */
    function updateTabTitles() {
        if (!state.crops || !Array.isArray(state.crops)) {
            return;
        }
        // Find all tab title spans using data-crop-id attribute
        const tabTitles = rootEditorElement.querySelectorAll('[data-crop-id]');
        tabTitles.forEach((tabTitle) => {
            const cropId = tabTitle.getAttribute('data-crop-id');
            if (!cropId) return;

            // Check if a crop exists for this type
            const hasCrop = state.crops.some((c) => c && c.type === cropId);

            // Update the text content
            const displayName = cropId.charAt(0).toUpperCase() + cropId.slice(1);
            tabTitle.textContent = hasCrop ? `${displayName} ✓` : displayName;
        });
    }

    /**
     * Select crop for editing
     */
    function selectCropForEditing(cropType) {
        const typeMap = { default: 'Default', tablet: 'Tablet', desktop: 'Desktop' };
        state.cropDisplayType = typeMap[cropType] || 'Default';
        state.editingCropType = cropType;

        // Load existing crop or create new editing rectangle
        const existingCrop = state.crops.find((c) => c.type === cropType);
        if (existingCrop) {
            state.cropRectangle = {
                x: existingCrop.topLeft.x,
                y: existingCrop.topLeft.y,
                width: existingCrop.size.width,
                height: existingCrop.size.height,
            };
            // Restore aspect ratio (handle "Free" mode)
            // Check if it's a freeform crop (aspect ratio is 1:1 but might be free)
            // For now, we'll check if aspectRatio exists and restore it
            if (existingCrop.aspectRatio && existingCrop.aspectRatio.w && existingCrop.aspectRatio.h) {
                state.cropAspectRatio = `${existingCrop.aspectRatio.w}:${existingCrop.aspectRatio.h}`;
                // Default to fixed mode when restoring (we don't store the type, so assume fixed)
                state.cropAspectType = 'fixed';
            } else {
                state.cropAspectRatio = '1:1';
                state.cropAspectType = 'free';
            }
            // Update button states
            updateTabUI(cropType);
        } else {
            // Initialize new crop rectangle
            state.cropRectangle = {
                x: 25,
                y: 25,
                width: 50,
                height: 50,
            };
            if (!state.cropAspectRatio) {
                state.cropAspectRatio = '1:1';
            }
            updateCropRectangleForAspectRatio();
        }

        // Update UI for this tab
        updateTabUI(cropType);
        updateImagePreview();
    }

    /**
     * Update UI for a specific tab
     */
    function updateTabUI(cropType) {
        const addBtn = rootEditorElement.querySelector(`.add-crop-btn-${cropType}`);
        const controls = rootEditorElement.querySelector(`.crop-controls-${cropType}`);
        const aspectRatioBtns = controls ? controls.querySelectorAll('.aspect-ratio-btn') : [];

        if (addBtn && controls) {
            const hasCrop = state.crops.some((c) => c.type === cropType);
            const isEditing = state.editingCropType === cropType;

            if (hasCrop || isEditing) {
                addBtn.style.display = 'none';
                controls.style.display = 'block';
            } else {
                addBtn.style.display = 'block';
                controls.style.display = 'none';
            }
        }

        // Update aspect ratio button states
        aspectRatioBtns.forEach((btn) => {
            const ratio = btn.getAttribute('data-ratio') || '';
            const isFreeButton = ratio === '';
            const isSelected = (isFreeButton && state.cropAspectType === 'free')
                              || (!isFreeButton && state.cropAspectType === 'fixed' && state.cropAspectRatio === ratio);

            if (isSelected) {
                btn.classList.add('slds-button_brand');
                btn.classList.remove('slds-button_neutral');
            } else {
                btn.classList.remove('slds-button_brand');
                btn.classList.add('slds-button_neutral');
            }
        });
    }

    /**
     * Add crop - initialize crop rectangle for specified type
     */
    function addCrop(cropType) {
        // Check if crop already exists
        const existingCrop = state.crops.find((c) => c.type === cropType);
        if (existingCrop) {
            selectCropForEditing(cropType);
            return;
        }

        state.editingCropType = cropType;
        const typeMap = { default: 'Default', tablet: 'Tablet', desktop: 'Desktop' };
        state.cropDisplayType = typeMap[cropType] || 'Default';

        // Set default aspect ratio to 1:1 if not set
        if (!state.cropAspectRatio) {
            state.cropAspectRatio = '1:1';
        }

        // Initialize crop rectangle in center, will be adjusted by aspect ratio
        state.cropRectangle = {
            x: 25,
            y: 25,
            width: 50,
            height: 50,
        };

        // Apply aspect ratio (will span longest direction)
        updateCropRectangleForAspectRatio();

        // Immediately save to array
        saveCropToArray();

        // Update UI
        updateTabUI(cropType);
        updateImagePreview();
    }

    /**
     * Remove crop for specified type
     */
    function removeCrop(cropType) {
        const targetType = cropType || state.editingCropType;
        if (!targetType) return;

        // Remove crop from array
        state.crops = state.crops.filter((c) => c.type !== targetType);

        // If removing the currently editing crop, clear editing state
        if (state.editingCropType === targetType) {
            state.editingCropType = null;
            state.cropRectangle = null;

            // Remove editing overlay from DOM
            const previewContainer = rootEditorElement.querySelector('.image-preview');
            if (previewContainer && activeOverlay) {
                if (activeOverlay.parentNode) {
                    activeOverlay.parentNode.removeChild(activeOverlay);
                }
                activeOverlay = null;
            }

            // Also remove from cropOverlays if it exists there
            if (cropOverlays[targetType]) {
                delete cropOverlays[targetType];
            }
            // Update UI and return early
            updateTabUI(targetType);
            updateTabTitles();
            updateImagePreview();
            return;
        }
        // Remove the overlay for this crop type
        if (cropOverlays[targetType]) {
            const overlay = cropOverlays[targetType];
            if (overlay && overlay.parentNode) {
                overlay.parentNode.removeChild(overlay);
            }
            delete cropOverlays[targetType];
        }

        // Update UI
        updateTabUI(targetType);
        updateTabTitles();
        updateImagePreview();
    }

    /**
     * Handle tab change
     */
    function handleTabChange(cropType) {
        const typeMap = { default: 'Default', tablet: 'Tablet', desktop: 'Desktop' };
        state.cropDisplayType = typeMap[cropType] || 'Default';

        // Load existing crop for this display type if it exists
        const existingCrop = state.crops.find((c) => c.type === cropType);
        if (existingCrop) {
            selectCropForEditing(cropType);
        } else {
            // No crop for this type yet - stop editing
            if (state.editingCropType !== cropType) {
                state.editingCropType = null;
                state.cropRectangle = null;
                activeOverlay = null;
            }
            updateTabUI(cropType);
            updateImagePreview();
        }
    }

    /**
     * Handle aspect ratio change
     */
    function handleAspectRatioChange(ratio) {
        // Empty string means "Free" mode (no aspect ratio constraint)
        if (ratio === '' || ratio === null || ratio === undefined) {
            state.cropAspectType = 'free';
            state.cropAspectRatio = '1:1'; // Keep a default value for storage
        } else {
            state.cropAspectType = 'fixed';
            state.cropAspectRatio = ratio;
        }

        if (state.editingCropType && state.cropRectangle) {
            // Update rectangle based on aspect ratio (or freeform if ratio is empty)
            updateCropRectangleForAspectRatio();
            updateTabUI(state.editingCropType);
            // saveCropToArray() is called inside updateCropRectangleForAspectRatio()
        }
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
                    <div class="images-list-container" style="flex: 1; display: flex; flex-direction: column; padding: 1rem; overflow-y: auto; min-height: 0;">
                        <div class="slds-text-body_small slds-text-color_weak" style="text-align: center; padding: 2rem;">
                            Select a folder from the left to view images
                        </div>
                    </div>
                    
                    <!-- Image Editor -->
                    <div class="image-editor-container" style="display: none; flex: 1; flex-direction: column; padding: 1rem; background-color: #ffffff; overflow-y: auto;">
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

                                <!-- Crop Controls with Tabs -->
                                <div class="slds-tabs_default slds-m-top_medium">
                                    <ul class="slds-tabs_default__nav" role="tablist">
                                        <li class="slds-tabs_default__item slds-is-active" title="Default" role="presentation">
                                            <a class="slds-tabs_default__link" href="#tab-default" role="tab" aria-selected="true" aria-controls="tab-default" id="tab-default__item" data-tab="default" data-crop-id="default">
                                                <span data-crop-id="default">Default</span>
                                            </a>
                                        </li>
                                        <li class="slds-tabs_default__item" title="Tablet" role="presentation">
                                            <a class="slds-tabs_default__link" href="#tab-tablet" role="tab" aria-selected="false" aria-controls="tab-tablet" id="tab-tablet__item" data-tab="tablet" data-crop-id="tablet">
                                                <span data-crop-id="tablet">Tablet</span>
                                            </a>
                                        </li>
                                        <li class="slds-tabs_default__item" title="Desktop" role="presentation">
                                            <a class="slds-tabs_default__link" href="#tab-desktop" role="tab" aria-selected="false" aria-controls="tab-desktop" id="tab-desktop__item" data-tab="desktop" data-crop-id="desktop">
                                                <span data-crop-id="desktop">Desktop</span>
                                            </a>
                                        </li>
                                    </ul>
                                    <div id="tab-default" class="slds-tabs_default__content slds-show" role="tabpanel" aria-labelledby="tab-default__item">
                                        <div class="tab-content-default">
                                            <button class="slds-button slds-button_neutral add-crop-btn-default" style="width: 100%;">Add Crop</button>
                                            <div class="crop-controls-default" style="display: none;">
                                                <div class="slds-m-top_small">
                                                    <button class="slds-button slds-button_destructive remove-crop-btn-default" style="width: 100%;">Remove Crop</button>
                                                </div>
                                                <div class="slds-m-top_small">
                                                    <label class="slds-form-element__label">Aspect Ratio</label>
                                                    <div class="slds-button-group" role="group" style="margin-top: 0.5rem;">
                                                        <button class="slds-button slds-button_neutral aspect-ratio-btn" data-ratio="1:1">1:1</button>
                                                        <button class="slds-button slds-button_neutral aspect-ratio-btn" data-ratio="16:9">16:9</button>
                                                        <button class="slds-button slds-button_neutral aspect-ratio-btn" data-ratio="9:16">9:16</button>
                                                        <button class="slds-button slds-button_neutral aspect-ratio-btn" data-ratio="4:3">4:3</button>
                                                        <button class="slds-button slds-button_neutral aspect-ratio-btn" data-ratio="3:4">3:4</button>
                                                        <button class="slds-button slds-button_neutral aspect-ratio-btn" data-ratio="">Free</button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div id="tab-tablet" class="slds-tabs_default__content slds-hide" role="tabpanel" aria-labelledby="tab-tablet__item">
                                        <div class="tab-content-tablet">
                                            <button class="slds-button slds-button_neutral add-crop-btn-tablet" style="width: 100%;">Add Crop</button>
                                            <div class="crop-controls-tablet" style="display: none;">
                                                <div class="slds-m-top_small">
                                                    <button class="slds-button slds-button_destructive remove-crop-btn-tablet" style="width: 100%;">Remove Crop</button>
                                                </div>
                                                <div class="slds-m-top_small">
                                                    <label class="slds-form-element__label">Aspect Ratio</label>
                                                    <div class="slds-button-group" role="group" style="margin-top: 0.5rem;">
                                                        <button class="slds-button slds-button_neutral aspect-ratio-btn" data-ratio="1:1">1:1</button>
                                                        <button class="slds-button slds-button_neutral aspect-ratio-btn" data-ratio="16:9">16:9</button>
                                                        <button class="slds-button slds-button_neutral aspect-ratio-btn" data-ratio="9:16">9:16</button>
                                                        <button class="slds-button slds-button_neutral aspect-ratio-btn" data-ratio="4:3">4:3</button>
                                                        <button class="slds-button slds-button_neutral aspect-ratio-btn" data-ratio="3:4">3:4</button>
                                                        <button class="slds-button slds-button_neutral aspect-ratio-btn" data-ratio="">Free</button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div id="tab-desktop" class="slds-tabs_default__content slds-hide" role="tabpanel" aria-labelledby="tab-desktop__item">
                                        <div class="tab-content-desktop">
                                            <button class="slds-button slds-button_neutral add-crop-btn-desktop" style="width: 100%;">Add Crop</button>
                                            <div class="crop-controls-desktop" style="display: none;">
                                                <div class="slds-m-top_small">
                                                    <button class="slds-button slds-button_destructive remove-crop-btn-desktop" style="width: 100%;">Remove Crop</button>
                                                </div>
                                                <div class="slds-m-top_small">
                                                    <label class="slds-form-element__label">Aspect Ratio</label>
                                                    <div class="slds-button-group" role="group" style="margin-top: 0.5rem;">
                                                        <button class="slds-button slds-button_neutral aspect-ratio-btn" data-ratio="1:1">1:1</button>
                                                        <button class="slds-button slds-button_neutral aspect-ratio-btn" data-ratio="16:9">16:9</button>
                                                        <button class="slds-button slds-button_neutral aspect-ratio-btn" data-ratio="9:16">9:16</button>
                                                        <button class="slds-button slds-button_neutral aspect-ratio-btn" data-ratio="4:3">4:3</button>
                                                        <button class="slds-button slds-button_neutral aspect-ratio-btn" data-ratio="3:4">3:4</button>
                                                        <button class="slds-button slds-button_neutral aspect-ratio-btn" data-ratio="">Free</button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div class="slds-m-top_medium">
                                    <button class="slds-button slds-button_brand apply-btn" style="width: 100%;">Apply</button>
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

        // Tab navigation
        rootEditorElement.querySelectorAll('[data-tab]').forEach((tabLink) => {
            tabLink.addEventListener('click', (e) => {
                e.preventDefault();
                const cropType = tabLink.getAttribute('data-tab');

                // Update tab states
                rootEditorElement.querySelectorAll('.slds-tabs_default__item').forEach((item) => {
                    item.classList.remove('slds-is-active');
                });
                rootEditorElement.querySelectorAll('.slds-tabs_default__content').forEach((content) => {
                    content.classList.remove('slds-show');
                    content.classList.add('slds-hide');
                });

                tabLink.closest('.slds-tabs_default__item').classList.add('slds-is-active');
                const tabContent = rootEditorElement.querySelector(`#tab-${cropType}`);
                if (tabContent) {
                    tabContent.classList.remove('slds-hide');
                    tabContent.classList.add('slds-show');
                }

                handleTabChange(cropType);
            });
        });

        // Add crop buttons for each tab
        ['default', 'tablet', 'desktop'].forEach((type) => {
            const addBtn = rootEditorElement.querySelector(`.add-crop-btn-${type}`);
            if (addBtn) {
                addBtn.addEventListener('click', () => {
                    addCrop(type);
                });
            }

            const removeBtn = rootEditorElement.querySelector(`.remove-crop-btn-${type}`);
            if (removeBtn) {
                removeBtn.addEventListener('click', () => {
                    removeCrop(type);
                });
            }
        });

        // Aspect ratio buttons
        rootEditorElement.querySelectorAll('.aspect-ratio-btn').forEach((btn) => {
            btn.addEventListener('click', () => {
                const ratio = btn.getAttribute('data-ratio');
                handleAspectRatioChange(ratio);
            });
        });

        rootEditorElement.querySelector('.apply-btn').addEventListener('click', async () => {
            if (state.currentImage) {
                // Ensure latest crop changes are saved
                if (state.editingCropType && state.cropRectangle) {
                    saveCropToArray();
                }

                // Get preview URL using default crop (fallback logic)
                const previewUrl = await updateImageURLs(state.currentImage, state.crops, state.quality, 'default');

                // Emit breakout apply event for breakout editor communication
                const payload = {
                    previewUrl,
                    imagePath: state.currentImage,
                    sourceDimensions: state.currentImageDimensions,
                    quality: state.quality,
                    crops: state.crops,
                };

                debugger;

                emit({
                    type: 'sfcc:value',
                    payload,
                });

                emit({
                    type: 'sfcc:breakoutApply',
                    value: payload,
                });
            }
        });
        rootEditorElement.querySelector('.close-editor-btn').addEventListener('click', () => {
            hideImageEditor();
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
    subscribe('sfcc:ready', (data) => {
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

    subscribe('sfcc:value', (data) => {
        console.log('sfcc:value', data);
        if (data && data.value && data.value.imageUrl) {
            state.currentImage = data.value.imageUrl;
            selectImage(data.value.imageUrl);
        }
    });
    // Initialize
    init();
}());

