import { LayoutEditorRoot } from "src/components";
import { editor, EditorProps } from "./editor-container";
import { LayoutEditorRootProps } from "src/components/organisms/layout-editor/layout-editor-root";

const LayoutEditor = editor(function (props : EditorProps | LayoutEditorRootProps) {
    return <LayoutEditorRoot 
                {...props}
                value={props.value?.value}
                breakpointsConfig={props.breakpointsConfig}
            />;
})

export default LayoutEditor;
