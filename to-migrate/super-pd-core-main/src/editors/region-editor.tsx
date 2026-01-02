import { RegionEditorRoot } from "src/components";
import { RegionEditorRootProps } from "src/components/organisms/region-editor/region-editor-root";
import { editor, EditorProps } from "./editor-container";


const RegionEditor = editor(function (props : EditorProps | RegionEditorRootProps) {
    return <RegionEditorRoot
                {...props}
                value={props.value?.value}
                breakpointsConfig={props.breakpointsConfig}
            />;
})

export default RegionEditor;
