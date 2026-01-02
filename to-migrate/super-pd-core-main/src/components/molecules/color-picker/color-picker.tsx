import React, { ReactElement, useEffect, useRef, useState } from "react";
import { ColorResult } from '@myassir/react-color';
import { Portal } from 'react-portal';

import { getClosestAncestor } from "src/utilities";
import ColorPickerPopup from "./color-picker-popup";

import styles from './color-picker.module.scss';

export interface ColorPickerProps {
    value?: string;
    name?: string;
    hideLabel?: boolean;
    onChange: (a: string) => void
}

export default function ColorPicker({
    name,
    value = '',
    hideLabel,
    onChange
} : ColorPickerProps) : ReactElement<ColorPickerProps> {
    const [colorPickerActive, setColorPickerActive] = useState(false);
    const [selectedColor, setSelectedColor] = useState(value);
    const iframeId = window.parentIFrame.getId();
    const buttonRef = useRef<HTMLButtonElement>(null);

    useEffect(() => setSelectedColor(value), [value]);

    function handleChange(color: ColorResult) {
        const rgba = color.rgb;
        setSelectedColor(`rgba(${rgba.r}, ${rgba.g}, ${rgba.b}, ${rgba.a})`)
    }

    function handleChangeComplete(color: ColorResult) {
        const rgb = color.rgb;
        if (onChange) {
            onChange(`rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${rgb.a})`);
        }
    }

    function toggleColorPicker(event: React.MouseEvent<HTMLButtonElement>) {
        setColorPickerActive(!colorPickerActive);
        event.stopPropagation();
        return false;
    }

    if(!iframeId) return <></>;

    const iframeElement = window.top?.document.querySelector(`#${iframeId}`) as HTMLElement;
    const editorsContainer = getClosestAncestor(iframeElement, 'form') as HTMLElement;
    return (
        <div className={`${styles.colorPickerContainer} slds-form-element`}>
            {!hideLabel && <label className="slds-form-element__label">{name}</label>}
            <div className="slds-form-element__control slds-grid">
                <input
                    type="text"
                    value={selectedColor}
                    placeholder={name}
                    className="slds-input slds-m-right_x-small"
                    readOnly
                />
                <div className={`${styles.pickerButtonContainer} slds-size_xxx-small`}>
                    <button
                        className={`${styles.colorPickerButton} slds-button slds-button_neutral`}
                        style={{backgroundColor: selectedColor}}
                        onClick={toggleColorPicker}
                        ref={buttonRef}
                    ></button>
                </div>
            </div>

            {colorPickerActive && (
                <Portal node={editorsContainer}>
                    <ColorPickerPopup
                        buttonRef={buttonRef}
                        editorsContainer={editorsContainer}
                        iframeElement={iframeElement}
                        selectedColor={selectedColor}
                        onChange={handleChange}
                        onChangeComplete={handleChangeComplete}
                        onColorPickerDisplayChange={setColorPickerActive}
                    />
                </Portal>
            )}
        </div>
    )    
}
