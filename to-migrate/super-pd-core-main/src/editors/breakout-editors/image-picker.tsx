import { ImagePicker } from 'src/components';
import { editor, EditorProps } from "src/editors/editor-container";

const ImagePickerEditor = editor(function (props : EditorProps) {
    return <ImagePicker {...props} />;
})

export default ImagePickerEditor;
