/**
 * Image Input Editor - Vanilla JavaScript implementation
 * This code is based on: https://github.com/sfccplus/super-page-designer
 */
(function () {
    let rootEditorElement;
    let currentValue = '';

    /**
     * Initialize the editor markup
     */
    function init() {
        rootEditorElement = document.createElement('div');
        rootEditorElement.innerHTML = `
            <div class="slds-form-element">
                <label class="slds-form-element__label">Image</label>
                <div class="slds-form-element__control" style="display: flex; align-items: center; gap: 0.5rem;">
                    <div class="image-preview-container" style="width: 230px; height: 150px; border: 1px solid #dddbda; background-size: contain; background-position: center; background-repeat: no-repeat; background-color: #f3f2f2;"></div>
                    <div class="slds-button-group" role="group">
                        <button class="slds-button slds-button_icon slds-button_icon-error slds-button_icon-border-filled delete-image-btn" style="display: none;" title="Delete">
                            <i class="fas fa-trash-alt slds-button__icon"></i>
                            <span class="slds-assistive-text">Delete</span>
                        </button>
                        <button class="slds-button slds-button_icon slds-button_icon-border-filled open-image-manager-btn" title="Open Image Manager">
                            <i class="fas open-icon slds-button__icon"></i>
                            <span class="slds-assistive-text">Open</span>
                        </button>
                        <button class="slds-button slds-button_icon slds-button_icon-border-filled image-config-details-btn" aria-describedby="help" title="Image Config Details">
                            <i class="fas fa-info-circle slds-button__icon"></i>
                            <span class="slds-assistive-text">Image Config Details</span>
                            <div id="image-config-details" style="position:relative">
                                <div class="slds-popover slds-popover_tooltip slds-nubbin_right" role="tooltip" id="help" style="position:absolute;right:100%;top:50%;transform:translateY(-50%);margin-right:0.5rem;display:none;">
                                    <div class="slds-popover__body" style="font-size:6pt;"></div>
                                </div>
                            </div>
                        </button>
                        </div>
                </div>
            </div>
        `;
        document.body.appendChild(rootEditorElement);
    }

    /**
     * Update the preview image
     */
    function updatePreview(imageURL) {
        const previewContainer = rootEditorElement.querySelector('.image-preview-container');
        const deleteBtn = rootEditorElement.querySelector('.delete-image-btn');

        if (imageURL) {
            // Reduce image quality for preview
            const previewURL = `${imageURL + (imageURL.indexOf('?') === -1 ? '?' : '&')}width=230`;
            previewContainer.style.backgroundImage = `url("${previewURL}")`;
            deleteBtn.style.display = 'inline-block';
        } else {
            previewContainer.style.backgroundImage = '';
            deleteBtn.style.display = 'none';
        }
    }

    /**
     * Handle image selection from breakout editor
     */
    function handleBreakoutClose({ type, value }, event) {
        if (type === 'sfcc:breakoutApply' && value) {
            const previewUrl = value.previewUrl || '';
            currentValue = previewUrl;
            updatePreview(previewUrl);
            updateIcon();
            updateHoverInfo(value);
            emit({
                type: 'sfcc:value',
                payload: value,
            });
        }
    }

    function updateHoverInfo(value) {
        if (value) {
            rootEditorElement.querySelector('#image-config-details .slds-popover__body').innerHTML = `
                <p>Image Path: ${value.imagePath}</p>
                <p>Image Quality: ${value.quality}</p>
                <p>Image Crops: ${value.crops.map((crop) => crop.type).join(', ')}</p>
            `;
        } else {
            rootEditorElement.querySelector('#image-config-details').style.display = 'none';
        }
    }

    /**
     * Open the image manager breakout editor
     */
    function openImageManager() {
        emit({
            type: 'sfcc:breakout',
            payload: {
                id: 'imagesManager',
                title: 'Select an Image',
            },
        }, handleBreakoutClose);
    }

    /**
     * Delete the current image
     */
    function deleteImage() {
        currentValue = '';
        updatePreview('');
        updateIcon();
        emit({
            type: 'sfcc:value',
            payload: null,
        });
    }

    /**
     * Update the icon based on whether a value is set
     */
    function updateIcon() {
        const iconElement = rootEditorElement.querySelector('.open-icon');
        if (iconElement) {
            if (currentValue) {
                iconElement.className = 'fas fa-pencil-alt open-icon slds-button__icon';
            } else {
                iconElement.className = 'fas fa-folder-open open-icon slds-button__icon';
            }
        }
    }

    // Listen for SFCC ready event
    listen('sfcc:ready', (data) => {
        const value = data.value;
        currentValue = (value && typeof value === 'object' && value.previewUrl) ? value.previewUrl : (value || '');

        updateHoverInfo(value);
        updateIcon();
        // Set up event listeners
        rootEditorElement.querySelector('.open-image-manager-btn').addEventListener('click', openImageManager);
        rootEditorElement.querySelector('.delete-image-btn').addEventListener('click', deleteImage);

        // Set up hover handlers for image config details popover
        const imageConfigDetailsContainer = rootEditorElement.querySelector('#image-config-details');
        const imageConfigDetailsBtn = rootEditorElement.querySelector('.image-config-details-btn');
        const popover = rootEditorElement.querySelector('#help');

        if (imageConfigDetailsContainer && popover) {
            const showPopover = () => {
                if (currentValue) {
                    popover.style.display = 'block';
                }
            };

            const hidePopover = () => {
                popover.style.display = 'none';
            };

            imageConfigDetailsBtn.addEventListener('mouseenter', showPopover);
            imageConfigDetailsBtn.addEventListener('mouseleave', hidePopover);
            popover.addEventListener('mouseenter', showPopover);
            popover.addEventListener('mouseleave', hidePopover);
        }

        // Update preview with initial value
        updatePreview(currentValue);
    });

    // Initialize
    init();
}());

