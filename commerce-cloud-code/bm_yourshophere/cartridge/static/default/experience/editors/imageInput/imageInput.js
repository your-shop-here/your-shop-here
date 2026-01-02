/**
 * Image Input Editor - Vanilla JavaScript implementation
 * This code is based on: https://github.com/sfccplus/super-page-designer
 */
(function () {
    'use strict';

    var rootEditorElement;
    var currentValue = '';

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
                            <i class="fas fa-folder-open slds-button__icon"></i>
                            <span class="slds-assistive-text">Open</span>
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
        var previewContainer = rootEditorElement.querySelector('.image-preview-container');
        var deleteBtn = rootEditorElement.querySelector('.delete-image-btn');
        
        if (imageURL) {
            // Reduce image quality for preview
            var previewURL = imageURL + (imageURL.indexOf('?') === -1 ? '?' : '&') + 'width=230';
            previewContainer.style.backgroundImage = 'url("' + previewURL + '")';
            deleteBtn.style.display = 'inline-block';
        } else {
            previewContainer.style.backgroundImage = '';
            deleteBtn.style.display = 'none';
        }
    }

    /**
     * Handle image selection from breakout editor
     */
    function handleBreakoutClose(event) {
        if (event && event.type === 'sfcc:breakoutApply' && event.value) {
            currentValue = event.value.value || '';
            updatePreview(currentValue);
            emit({
                type: 'sfcc:value',
                payload: currentValue ? { value: currentValue } : null
            });
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
        emit({
            type: 'sfcc:value',
            payload: null
        });
    }

    // Listen for SFCC ready event
    listen('sfcc:ready', function (data) {
        var value = data.value;
        currentValue = (value && typeof value === 'object' && value.value) ? value.value : (value || '');

        // Set up event listeners
        rootEditorElement.querySelector('.open-image-manager-btn').addEventListener('click', openImageManager);
        rootEditorElement.querySelector('.delete-image-btn').addEventListener('click', deleteImage);

        // Update preview with initial value
        updatePreview(currentValue);
    });

    // Initialize
    init();
})();

