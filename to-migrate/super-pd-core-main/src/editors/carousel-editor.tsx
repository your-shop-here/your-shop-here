import { CarouselEditorRoot } from "src/components";
import { editor, EditorProps } from "./editor-container";

const CarouselEditor = editor(function (props : EditorProps) {
    return <CarouselEditorRoot 
                {...props}
                value={props.value?.value}
            />;
})

export default CarouselEditor;
