import { useEffect, useState } from 'react';

import styles from './image-input.module.scss';

interface ImageInputProps {
    name: string;
    value: string;
    onChange: (payload: EditorPayload) => void;
    hideLabel?: boolean;
}

export default function ImageInput({ name, value, onChange, hideLabel } : ImageInputProps) {
    const [ imgValue, setImgValue ] = useState(value);

    useEffect(() => {
        setImgValue(value)
    }, [value])

    function handleChange(value: EditorPayload) {
        // Update the img when a value is selected from the breakout editor
        setImgValue(value.value);
        onChange(value);
    }

    function handleBreakoutClose({ type, value } : any) {
        if (type === 'sfcc:breakoutApply') {
            handleChange(value);
        }
    }

    function handleBreakoutOpen() {
        emit(
            {
                type: 'sfcc:breakout',
                payload: {
                    id: 'spdImagesManager',
                    title: 'Select an Image',
                },
            },
            handleBreakoutClose
        );
    }

    // Reduce image quality for preview
    const previewURL = imgValue ? imgValue + '&width=230' : '';

    return (
        <div className="slds-form-element">
            {!hideLabel && <label className="slds-form-element__label">{name}</label>}

            <div className={styles.imageInputContainer}>
                <div
                    className={styles.imageContainer}
                    style={{
                        ...(previewURL ? { backgroundImage: `url("${previewURL}")` } : {}),
                    }}
                ></div>
                <div className={styles.actionsContainer}>
                    {previewURL && (
                        <button
                            onClick={() => handleChange({ value: ''})}
                            className="slds-button slds-button_icon slds-button_icon-error slds-button_icon-border-filled"
                        >
                            <i className="fas fa-trash-alt slds-button__icon"></i>
                            <span className="slds-assistive-text">Delete</span>
                        </button>
                    )}
                    <button
                        onClick={handleBreakoutOpen}
                        className="slds-button slds-button_icon slds-button_icon-border-filled"
                    >
                        <i className="fas fa-folder-open slds-button__icon"></i>
                        <span className="slds-assistive-text">Open</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
