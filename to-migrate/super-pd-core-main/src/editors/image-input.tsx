import { ImageInput } from "src/components";
import { editor, EditorProps } from "./editor-container";

const ImageInputEditor = editor(function (props : EditorProps) {
    return <ImageInput 
                {...props}
                name="Image"
                hideLabel={true}
                value={props.value?.value}
            />;
})

export default ImageInputEditor;
