/* global listen, emit, document, window */
/**
 * Rich Text Plus Editor - Quill based Page Designer custom editor
 * Provides configurable paragraph styles and text-shadow presets.
 */

/* global Quill */
// eslint-disable-next-line max-classes-per-file
(function () {
    const EDITOR_VERSION = '0.2.1';
    const DEFAULT_PARAGRAPH_TYPES = [
        { label: 'Paragraph', value: '', className: '' },
        { label: 'Lead paragraph', value: 'lead', className: 'para-lead' },
        { label: 'Eyebrow', value: 'eyebrow', className: 'para-eyebrow' },
        { label: 'Small print', value: 'small', className: 'para-small' },
    ];

    const BASE_STYLES = `
        .rte-plus { width: 100%; box-sizing: border-box; }
        .rte-plus__toolbar { }
        .rte-plus__editor.ql-container { border-radius: 0 0 0.25rem 0.25rem; min-height: 200px; }
        .ql-container.ql-snow { border: 1px solid #d8dde6; }
        .ql-editor { min-height: 180px; padding: 12px; }
        .rte-plus__toolbar select { }
        .rte-plus__toolbar .ql-formats { margin-right: 8px; }
        .rte-plus__toolbar .ql-picker-label::before { font-size: 12px; }
        .rte-plus__toolbar .ql-picker.ql-expanded .ql-picker-options { z-index: 10000; }
        .rte-plus__shadow-swatch { display: inline-block; width: 14px; height: 14px; background: #444; border-radius: 4px; vertical-align: middle; margin-right: 6px; box-shadow: none; }
        .rte-plus__shadow-option[data-shadow="soft"] .rte-plus__shadow-swatch { box-shadow: 0 1px 2px rgba(0,0,0,0.25); }
        .rte-plus__shadow-option[data-shadow="medium"] .rte-plus__shadow-swatch { box-shadow: 0 2px 6px rgba(0,0,0,0.35); }
        .rte-plus__shadow-option[data-shadow="strong"] .rte-plus__shadow-swatch { box-shadow: 0 4px 10px rgba(0,0,0,0.5); }
        .para-lead { font-size: 1.2rem; line-height: 1.6; }
        .para-eyebrow { text-transform: uppercase; letter-spacing: 0.08em; font-weight: 700; font-size: 0.85rem; }
        .para-small { font-size: 0.9rem; line-height: 1.4; }
    `;

    let rootEditorElement;
    let quillInstance;
    let symbolsUrl;

    function parseConfigArray(value, fallback) {
        if (!value) {
            return fallback;
        }
        if (typeof value === 'string') {
            try {
                return JSON.parse(value);
            } catch (e) {
                // Ignore parsing error and fall back
            }
        }
        return Array.isArray(value) ? value : fallback;
    }

    function uniqueId(prefix) {
        return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
    }

    function injectStyles() {
        if (document.getElementById('rte-plus-styles')) {
            return;
        }
        const styleEl = document.createElement('style');
        styleEl.id = 'rte-plus-styles';
        styleEl.innerHTML = BASE_STYLES;
        document.head.appendChild(styleEl);
    }

    function buildParagraphOptions(options) {
        return options.map((opt) => `<option value="${opt.value || ''}" data-format-name="${opt.className || ''}">${opt.label}</option>`).join('');
    }

    function buildSpanOptions(options) {
        // Extract base URL from symbolsUrl (e.g., "experience/editors/richtextplus/" from "experience/editors/richtextplus/symbols.svg")
        const baseUrl = symbolsUrl ? symbolsUrl.substring(0, symbolsUrl.lastIndexOf('/') + 1) : '';

        return `<ul class="slds-button-group-list">${options.map((opt) => {
            const iconPath = opt.icon || '';
            const isSprited = iconPath.includes('#');
            let iconMarkup = '';

            if (isSprited) {
                // Sprited SVG: Use <use> element with sprite reference
                // iconPath format: "icons/richtext-icons.svg#primary_background"
                iconMarkup = `<use href="${baseUrl}${iconPath}"></use>`;
            } else if (iconPath) {
                // Simple SVG file: Use <image> element to embed the SVG
                // iconPath format: "icons/drop-shadow.svg"
                iconMarkup = `<image href="${baseUrl}${iconPath}" width="100%" height="100%" preserveAspectRatio="xMidYMid meet"></image>`;
            }

            return `
        <li>
            <button class="ql-${opt.className} slds-button slds-button_icon slds-button_icon-border-filled" aria-label="${opt.label}" data-tag-name="${opt.tagName}" data-class-name="${opt.className}">
                <svg style="${opt.iconStyle || ''}" base-icon--prefix="slds-button__icon" class="slds-button__icon" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" aria-hidden="true" viewBox="0 0 24 24">
                    ${iconMarkup}
                </svg>
            </button>
        </li>
        `;
        }).join('')}</ul>`;
    }

    function buildToolbar(paragraphTypes, spanTypes, toolbarId) {
        return `
            <style>
                ${paragraphTypes.map((opt) => opt.previewCss).join('\n')}
                ${spanTypes.map((opt) => opt.previewCss).join('\n')}
            </style>
            <div id="${toolbarId}" class="slds-rich-text-editor__toolbar rte-plus__toolbar ql-toolbar">
                <ul class="slds-button-group-list">
                    <li>
                        <select class="slds-select rtplus-paratype" aria-label="Paragraph type">
                            ${buildParagraphOptions(paragraphTypes)}
                        </select>
                    </li>
                </ul>
                <ul class="slds-button-group-list">
                    <li>
                        <button class="ql-bold slds-button slds-button_icon slds-button_icon-border-filled" aria-label="Bold">
                            <svg base-icon--prefix="slds-button__icon" class="slds-button__icon" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" aria-hidden="true">
                                <use href="${symbolsUrl}#bold"></use>
                            </svg>
                        </button>
                    </li>
                    <li>
                        <button class="ql-italic slds-button slds-button slds-button_icon slds-button_icon-border-filled" aria-label="Italic">
                            <svg base-icon--prefix="slds-button__icon" class="slds-button__icon" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" aria-hidden="true">
                                <use href="${symbolsUrl}#italic"></use>
                            </svg>
                        </button>
                    </li>
                    <li>
                        <button class="ql-underline slds-button slds-button_icon slds-button_icon-border-filled" aria-label="Underline">
                            <svg base-icon--prefix="slds-button__icon" class="slds-button__icon" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" aria-hidden="true">
                                <use href="${symbolsUrl}#underline"></use>
                            </svg>
                        </button>
                    </li>
                    <li>
                        <button class="ql-strike slds-button slds-button_icon slds-button_icon-border-filled" aria-label="Strikethrough">
                            <svg base-icon--prefix="slds-button__icon" class="slds-button__icon" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" aria-hidden="true">
                                <use href="${symbolsUrl}#strikethrough"></use>
                            </svg>
                        </button>
                    </li>
                    <li>
                        <button class="ql-blockquote slds-button slds-button_icon slds-button_icon-border-filled" aria-label="Blockquote">
                            <svg base-icon--prefix="slds-button__icon" class="slds-button__icon" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" aria-hidden="true">
                                <use href="${symbolsUrl}#quotation_marks"></use>
                            </svg>
                        </button>
                    </li>
                </ul>
                <span class="ql-formats">
                    ${buildSpanOptions(spanTypes)}
                </span>
                <ul class="slds-button-group-list">
                    <li>
                        <button class="slds-button slds-button_icon slds-button_icon-border-filled ql-align" value="" aria-label="Left align text">
                            <svg base-icon--prefix="slds-button__icon" class="slds-button__icon" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" aria-hidden="true">
                                <use href="${symbolsUrl}#left_align_text"></use>
                            </svg>
                        </button>
                    </li>
                    <li>
                        <button class="slds-button slds-button_icon slds-button_icon-border-filled ql-align" value="center" aria-label="Center align text">
                            <svg base-icon--prefix="slds-button__icon" class="slds-button__icon" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" aria-hidden="true">
                                <use href="${symbolsUrl}#center_align_text"></use>
                            </svg>
                        </button>
                    </li>
                    <li>
                        <button class="slds-button slds-button_icon slds-button_icon-border-filled ql-align" value="right" aria-label="Right align text">
                            <svg base-icon--prefix="slds-button__icon" class="slds-button__icon" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" aria-hidden="true">
                                <use href="${symbolsUrl}#right_align_text"></use>
                            </svg>
                        </button>
                    </li>
                </ul>
                <ul class="slds-button-group-list">
                    <li>
                        <button class="ql-list slds-button slds-button_icon slds-button_icon-border-filled" value="bullet" aria-label="Bulleted list">
                            <svg base-icon--prefix="slds-button__icon" class="slds-button__icon" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" aria-hidden="true">
                                <use href="${symbolsUrl}#richtextbulletedlist"></use>
                            </svg>
                        </button>
                    </li>
                    <li>
                        <button class="ql-list slds-button slds-button_icon slds-button_icon-border-filled" value="ordered" aria-label="Numbered list">
                            <svg base-icon--prefix="slds-button__icon" class="slds-button__icon" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" aria-hidden="true">
                                <use href="${symbolsUrl}#richtextnumberedlist"></use>
                            </svg>
                        </button>
                    </li>
                </ul>
                <ul class="slds-button-group-list">
                    <li>
                        <button class="ql-link slds-button slds-button_icon slds-button_icon-border-filled" aria-label="Insert link">
                            <svg base-icon--prefix="slds-button__icon" class="slds-button__icon" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" aria-hidden="true">
                                <use href="${symbolsUrl}#link"></use>
                            </svg>
                        </button>
                    </li>
                    <li>
                        <button class="ql-image slds-button slds-button_icon slds-button_icon-border-filled" aria-label="Insert image">
                            <svg base-icon--prefix="slds-button__icon" class="slds-button__icon" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" aria-hidden="true">
                                <use href="${symbolsUrl}#image"></use>
                            </svg>
                        </button>
                    </li>
                </ul>
                <ul class="slds-button-group-list">
                    <li>
                        <button class="ql-undo slds-button slds-button_icon slds-button_icon-border-filled" aria-label="Undo">
                            <svg base-icon--prefix="slds-button__icon" class="slds-button__icon" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" aria-hidden="true">
                                <use href="${symbolsUrl}#undo"></use>
                            </svg>
                        </button>
                    </li>
                    <li>
                        <button class="ql-redo slds-button slds-button_icon slds-button_icon-border-filled" aria-label="Redo">
                            <svg base-icon--prefix="slds-button__icon" class="slds-button__icon" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" aria-hidden="true">
                                <use href="${symbolsUrl}#redo"></use>
                            </svg>
                        </button>
                    </li>
                </ul>
                <ul class="slds-button-group-list">
                    <li>
                        <button class="ql-clean slds-button slds-button_icon slds-button_icon-border-filled" aria-label="Clear formatting">
                            <svg base-icon--prefix="slds-button__icon" class="slds-button__icon" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" aria-hidden="true">
                                <use href="${symbolsUrl}#remove_formatting"></use>
                            </svg>
                        </button>
                    </li>
                </ul>
            </div>
        `;
    }

    function buildEditorMarkup(ids, paragraphTypes, spanTypes) {
        return `
            <div class="rte-plus slds-rich-text-editor">
                ${buildToolbar(paragraphTypes, spanTypes, ids.toolbar)}
                <div id="${ids.editor}" class="rte-plus__editor" style="min-height:200px;"></div>
            </div>
        `;
    }

    function registerCustomFormats(spanTypes, paragraphTypes) {
        try {
            // eslint-disable-next-line no-undef
            const Inline = Quill.import('blots/inline');
            // eslint-disable-next-line no-undef
            const Block = Quill.import('blots/block');

            // Register paragraph type formats - one Block blot per paragraph type (like span types)
            if (paragraphTypes && Array.isArray(paragraphTypes)) {
                paragraphTypes.forEach((paragraphType) => {
                    if (paragraphType.className && paragraphType.tagName) {
                        // eslint-disable-next-line max-classes-per-file
                        const formatName = paragraphType.className;
                        const className = paragraphType.className;
                        const tagName = paragraphType.tagName || 'p';

                        // Create a custom block blot for this paragraph type
                        class ParagraphTypeBlot extends Block {
                            static create(value) {
                                const node = super.create();
                                if (value) {
                                    node.classList.add(className);
                                }
                                return node;
                            }

                            static formats(node) {
                                // Check if node has our class and matches our tagName
                                if (node.tagName.toLowerCase() === tagName.toLowerCase() && node.classList && node.classList.contains(className)) {
                                    return className;
                                }
                                return undefined;
                            }

                            format(name, value) {
                                if (name === formatName && this.domNode.classList) {
                                    const currentTagName = this.domNode.tagName.toLowerCase();

                                    // If applying this format and tagName doesn't match, we need to replace the blot
                                    if (value && (value === className || value === true)) {
                                        if (currentTagName !== tagName.toLowerCase()) {
                                            // Tag needs to change - replace this blot with the correct one
                                            const content = this.domNode.innerHTML;
                                            const newBlot = this.scroll.create(formatName, className);
                                            newBlot.domNode.innerHTML = content;
                                            // Copy attributes
                                            Array.from(this.domNode.attributes).forEach((attr) => {
                                                if (attr.name !== 'class') {
                                                    newBlot.domNode.setAttribute(attr.name, attr.value);
                                                }
                                            });
                                            newBlot.domNode.classList.add(className);
                                            this.replaceWith(newBlot);
                                            return;
                                        }
                                        this.domNode.classList.add(className);
                                    } else {
                                        this.domNode.classList.remove(className);
                                    }
                                } else {
                                    super.format(name, value);
                                }
                            }
                        }
                        ParagraphTypeBlot.blotName = formatName;
                        ParagraphTypeBlot.tagName = tagName;
                        ParagraphTypeBlot.className = className;
                        Quill.register(ParagraphTypeBlot, true);
                    }
                });
            }

            // Register span type formats - using className as format name everywhere
            if (spanTypes && Array.isArray(spanTypes)) {
                spanTypes.forEach((spanType) => {
                    if (spanType.className && spanType.tagName) {
                        // Use className as format name everywhere for consistency
                        const formatName = spanType.className;
                        const className = spanType.className;
                        const tagName = spanType.tagName || 'span';

                        // Create a custom inline blot that adds the class
                        class CustomStyleBlot extends Inline {
                            static create(value) {
                                const node = super.create();
                                if (value) {
                                    node.classList.add(className);
                                }
                                return node;
                            }

                            static formats(node) {
                                // Check if node has our class
                                if (node.classList && node.classList.contains(className)) {
                                    return className;
                                }
                                return undefined;
                            }

                            format(name, value) {
                                if (name === formatName && this.domNode.classList) {
                                    if (value && (value === className || value === true)) {
                                        this.domNode.classList.add(className);
                                    } else {
                                        this.domNode.classList.remove(className);
                                    }
                                } else {
                                    super.format(name, value);
                                }
                            }
                        }
                        CustomStyleBlot.blotName = formatName;
                        CustomStyleBlot.tagName = tagName;
                        CustomStyleBlot.className = className;
                        Quill.register(CustomStyleBlot, true);
                    }
                });
            }
        } catch (e) {
            console.error(`[RTE+ ${EDITOR_VERSION}] registerCustomFormats failed`, e);
        }
    }

    function emitValue() {
        if (!quillInstance) {
            return;
        }
        const html = quillInstance.root.innerHTML;
        emit({ type: 'sfcc:interacted' });
        emit({
            type: 'sfcc:value',
            payload: html && html !== '<p><br></p>' ? { value: html } : null,
        });
    }

    /**
     * Creates a handler function for a span type button
     * @param {string} formatName - The format name (spanType.value)
     * @param {string} className - The CSS class name to apply
     * @returns {Function} Handler function for the toolbar button
     */
    function createSpanTypeHandler(formatName, className) {
        // eslint-disable-next-line no-unused-vars
        return function handler(_value) {
            const quill = this.quill;
            const range = quill.getSelection(true);

            if (!range) {
                // eslint-disable-next-line no-console
                console.warn(`[RTE+ ${EDITOR_VERSION}] No selection for format: ${formatName}`);
                return;
            }

            // Toggle the format: if already applied, remove it; otherwise apply it
            const currentFormat = quill.getFormat(range);
            const currentValue = currentFormat[formatName];
            // The format returns the className when active, or true if applied
            const isActive = currentValue === className || currentValue === true;

            if (isActive) {
                // Remove the format
                quill.formatText(range.index, range.length, formatName, false, 'user');
            } else {
                // Apply the format - pass true or className as the value
                quill.formatText(range.index, range.length, formatName, true, 'user');
            }
        };
    }

    /**
     * Creates handlers object for all span types
     * @param {Array} spanTypes - Array of span type configurations
     * @returns {Object} Handlers object to merge into toolbar handlers
     */
    function createSpanTypeHandlers(spanTypes) {
        const handlers = {};
        if (spanTypes && Array.isArray(spanTypes)) {
            spanTypes.forEach((spanType) => {
                if (spanType.className) {
                    // Use className as format name everywhere for consistency
                    handlers[spanType.className] = createSpanTypeHandler(
                        spanType.className,
                        spanType.className,
                    );
                }
            });
        }
        return handlers;
    }

    function setupQuill(ids, placeholder, spanTypes, paragraphTypes) {
        registerCustomFormats(spanTypes, paragraphTypes);
        const container = document.getElementById(ids.editor);
        // eslint-disable-next-line no-console
        console.debug(`[RTE+ ${EDITOR_VERSION}] setupQuill`, ids, { containerExists: !!container });

        if (!container) {
            return false;
        }

        // Create handlers for span types
        const spanTypeHandlers = createSpanTypeHandlers(spanTypes);

        // Build formats array including span type formats and paragraph type formats
        const baseFormats = [
            'header',
            'bold',
            'italic',
            'underline',
            'strike',
            'blockquote',
            'align',
            'list',
            'link',
            'image',
        ];
        const spanTypeFormats = spanTypes && Array.isArray(spanTypes)
            ? spanTypes.map((st) => st.className).filter(Boolean)
            : [];
        const paragraphTypeFormats = paragraphTypes && Array.isArray(paragraphTypes)
            ? paragraphTypes.map((pt) => pt.className).filter(Boolean)
            : [];
        const formats = [...baseFormats, ...spanTypeFormats, ...paragraphTypeFormats];
        try {
            quillInstance = new window.Quill(`#${ids.editor}`, {
                // theme: 'snow',
                debug: 'log',
                placeholder: placeholder || 'Start writing…',
                modules: {
                    toolbar: {
                        container: `#${ids.toolbar}`,
                        handlers: {
                            undo() {
                                this.quill.history.undo();
                            },
                            redo() {
                                this.quill.history.redo();
                            },
                            // eslint-disable-next-line no-unused-vars
                            link(_value) {
                                const quill = this.quill;
                                const range = quill.getSelection(true);

                                // Get current selection or cursor position
                                const currentRange = range || quill.getSelection();
                                if (!currentRange) {
                                    return;
                                }

                                // Get current link if selection already has one
                                const currentLink = quill.getFormat(currentRange).link;

                                // Always open Page Designer link selector (even if link exists, allow editing)
                                emit({
                                    type: 'sfcc:breakout',
                                    payload: {
                                        id: 'sfcc:linkBuilder',
                                        title: currentLink ? 'Edit URL' : 'Select URL',
                                    },
                                }, ({ type, value: selectedUrl }) => {
                                    if (type === 'sfcc:breakoutApply') {
                                        if (selectedUrl) {
                                            let finalUrl = '';
                                            if (Array.isArray(selectedUrl.value)) {
                                                finalUrl = `$url(${selectedUrl.value.map((param) => `'${param}'`).join(',')})$`;
                                            } else {
                                                finalUrl = selectedUrl.value;
                                            }
                                            // Apply the selected URL to the current selection
                                            quill.formatText(currentRange.index, currentRange.length, 'link', finalUrl);
                                        } else {
                                            // If empty URL, remove the link
                                            quill.formatText(currentRange.index, currentRange.length, 'link', false);
                                        }
                                    }
                                });
                            },
                            image() {
                                const quill = this.quill;
                                const range = quill.getSelection(true);

                                // Get current selection or cursor position
                                const currentRange = range || quill.getSelection();
                                if (!currentRange) {
                                    return;
                                }

                                const insertIndex = currentRange.index;
                                const length = currentRange.length || 0;

                                // Open Page Designer image manager
                                emit({
                                    type: 'sfcc:breakout',
                                    payload: {
                                        id: 'imagesManager',
                                        title: 'Select an Image',
                                    },
                                }, ({ type, value: imageData }) => {
                                    if (type === 'sfcc:breakoutApply' && imageData) {
                                        const imageUrl = imageData.previewUrl || imageData.imagePath || '';
                                        if (imageUrl) {
                                            // Delete selected text if any, then insert image
                                            if (length > 0) {
                                                quill.deleteText(insertIndex, length, 'user');
                                            }
                                            // Insert image at current cursor position
                                            quill.insertEmbed(insertIndex, 'image', imageUrl, 'user');
                                            // Move cursor after the inserted image
                                            quill.setSelection(insertIndex + 1);
                                        }
                                    }
                                });
                            },
                            ...spanTypeHandlers,
                        },
                    },
                    history: {
                        delay: 2000,
                        maxStack: 500,
                        userOnly: true,
                    },
                },
                formats,
            });
        } catch (e) {
            // we do not swallow anything. BM includes this as a sandboxed iframe to ensure these editors are not affected by the main page.
            console.error(`[RTE+ ${EDITOR_VERSION}] setupQuill failed`, e);
            return false;
        }

        if (!quillInstance) {
            console.error(`[RTE+ ${EDITOR_VERSION}] quillInstance is undefined`);
            return false;
        }

        if (!quillInstance.root) {
            // eslint-disable-next-line no-console
            console.debug(`[RTE+ ${EDITOR_VERSION}] quill root missing`);
            return false;
        }
        quillInstance.on('text-change', () => {
            emitValue();
        });

        // Update paragraph type select when selection changes
        quillInstance.on('selection-change', (range) => {
            if (!range) {
                return;
            }
            // Get the current line to check which paragraph type is applied
            const [line] = quillInstance.getLine(range.index);
            let currentParaType = '';

            if (line && line.domNode && paragraphTypes) {
                const node = line.domNode;
                // Check which paragraph type class is applied
                paragraphTypes.forEach((pt) => {
                    if (pt.className && node.classList && node.classList.contains(pt.className)) {
                        currentParaType = pt.value || '';
                    }
                });
            }

            const selectEl = document.querySelector(`#${ids.toolbar} .rtplus-paratype`);
            if (selectEl) {
                selectEl.value = currentParaType;
            }
        });

        // Manually attach event listener to paragraph type select
        const paraTypeSelect = document.querySelector(`#${ids.toolbar} .rtplus-paratype`);
        if (paraTypeSelect && paragraphTypes) {
            paraTypeSelect.addEventListener('change', (e) => {
                const selectedValue = e.target.value;
                const selectedElement = e.target.options[e.target.selectedIndex];
                const formatName = selectedElement.dataset.formatName;
                const range = quillInstance.getSelection(true);

                if (range && formatName) {
                    // Find the paragraph type to get its tagName
                    const selectedParaType = paragraphTypes.find((pt) => pt.value === selectedValue);

                    if (selectedParaType && selectedParaType.className) {
                        // Remove all paragraph type formats from current line first
                        paragraphTypes.forEach((pt) => {
                            if (pt.className) {
                                quillInstance.formatLine(range.index, range.length, pt.className, false, 'user');
                            }
                        });

                        // Apply the selected paragraph type format
                        // Pass the className as the value so the format method recognizes it
                        quillInstance.formatLine(range.index, range.length, formatName, formatName, 'user');
                    } else if (!selectedValue) {
                        // Empty value - remove all paragraph type formats
                        paragraphTypes.forEach((pt) => {
                            if (pt.className) {
                                quillInstance.formatLine(range.index, range.length, pt.className, false, 'user');
                            }
                        });
                    }
                }
            });
        }

        return true;
    }

    function hydrateInitialValue(myInitialValue) {
        if (myInitialValue && quillInstance) {
            quillInstance.clipboard.dangerouslyPasteHTML(myInitialValue.value, 'api');
        }
    }

    listen('sfcc:ready', async (payload) => {
        // eslint-disable-next-line no-console
        console.debug(`[RTE+ ${EDITOR_VERSION}] ready`, { payloadConfig: !!payload.config, hasValue: !!payload.value });
        symbolsUrl = payload.config && payload.config.symbolsUrl;

        injectStyles();

        const paragraphTypes = parseConfigArray(payload.config && payload.config.paragraphTypes, DEFAULT_PARAGRAPH_TYPES);
        const spanTypes = parseConfigArray(payload.config && payload.config.spanTypes);

        const ids = {
            toolbar: uniqueId('rte-toolbar'),
            editor: uniqueId('rte-editor'),
        };

        rootEditorElement = document.createElement('div');
        rootEditorElement.innerHTML = buildEditorMarkup(ids, paragraphTypes, spanTypes);

        document.body.appendChild(rootEditorElement);

        setupQuill(ids, payload.config && payload.config.placeholder, spanTypes, paragraphTypes);

        if (payload.value) {
            hydrateInitialValue(payload.value);
        }
    });

    listen('sfcc:disabled', () => {
        if (quillInstance) {
            quillInstance.enable(false);
        }
    });

    listen('sfcc:required', (isRequired) => {
        if (rootEditorElement) {
            rootEditorElement.setAttribute('data-required', Boolean(isRequired));
        }
    });
}());

