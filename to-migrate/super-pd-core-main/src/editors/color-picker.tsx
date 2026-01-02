import { ColorPicker } from "src/components";
import { editor, EditorProps } from "./editor-container";

const ColorPickerEditor = editor(function (props : EditorProps) {
    function onChange(payload: string) {
        props.onChange({ value: payload })
    }

    return <ColorPicker 
                {...props}
                name="Color"
                hideLabel={true}
                value={props.value?.value}
                onChange={onChange}
            />;
})

export default ColorPickerEditor;
