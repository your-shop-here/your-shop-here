import { RefObject, useRef } from "react";
import { ChromePicker } from '@myassir/react-color';
import { getDistanceToAncestor } from "src/utilities";
import { useOutsideClick } from "src/hooks";

type ColorPickerPopupProps = {
    buttonRef: RefObject<any>;
    iframeElement: HTMLElement;
    editorsContainer: HTMLElement;
    selectedColor: string;
    onChangeComplete: any;
    onChange: any;
    onColorPickerDisplayChange: any;
}

function ColorPickerPopup ({
        buttonRef,
        iframeElement,
        editorsContainer,
        selectedColor,
        onChangeComplete,
        onChange,
        onColorPickerDisplayChange
} : ColorPickerPopupProps) {
    const colorPickerRef = useRef<HTMLDivElement>(null);

    // Listen to click event outside color picker
    useOutsideClick(
        colorPickerRef,
        () => onColorPickerDisplayChange(false),
        window.top
    );

    function getPickerPosition() {
        const buttonElement = buttonRef.current;

        if(!buttonElement) return;

        const clientRec = buttonElement.getBoundingClientRect();
        const iframePosition = getDistanceToAncestor(iframeElement, editorsContainer);

        return {
            top: iframePosition.top + clientRec.bottom + 5,
            left: iframePosition.left + iframeElement.clientWidth + 2,
        };
    }

    return (
        <div
            ref={colorPickerRef}
            style={{
                position: 'absolute',
                zIndex: '99999',
                userSelect: 'none',
                transform: 'translateX(-100%)',
                ...getPickerPosition()
            }}
        >
            <ChromePicker
                color={selectedColor}
                onChangeComplete={onChangeComplete}
                onChange={onChange}
            />
        </div>
    )
};


export default ColorPickerPopup;
