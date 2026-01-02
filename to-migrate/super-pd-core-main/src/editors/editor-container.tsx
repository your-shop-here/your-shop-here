import { ComponentType } from "react";

export type EditorPayload = {
    value: any;
    [key: string]: any
}

export type CloseCallBackData = {
    type: string;
    value: any;
}

export type EditorProps = {
    value?: EditorPayload;
    onChange: (payload: EditorPayload) => void;
    onValidationChange: (payload: boolean) => void;
    emitBreakout: (
        editorId: string,
        title: string,
        closeCallBack: (data : CloseCallBackData) => void
    ) => void;
    [key: string] : any
}

export function editor<Type> (Component : ComponentType<Type | EditorProps>) {
    function emitState(payload: any) {
        emit({
            type: 'sfcc:value',
            payload: payload,
        });
    }

    function emitValidationStatus(status: boolean) {
        emit({
            type: 'sfcc:valid',
            payload: {
                valid: status,
            },
        });
    }

    function emitBreakout(editorId: string, title: string, closeCallBack: (data : CloseCallBackData) => void) {
        emit(
            {
                type: 'sfcc:breakout',
                payload: {
                    id: editorId,
                    title: title,
                },
            },
            closeCallBack
        );
    }


    return (props: Type | Partial<EditorProps>) =>  (
        <Component
            onChange={emitState}
            onValidationChange={emitValidationStatus}
            emitBreakout={emitBreakout}
            {...props}
        />
    );
}