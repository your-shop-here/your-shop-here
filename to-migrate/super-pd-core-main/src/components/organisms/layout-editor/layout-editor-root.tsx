import { useState } from 'react';
import { assign, cloneDeep } from 'lodash';

import { generateSalt } from 'src/utilities';
import { CssHandler } from 'src/helpers';

import LayoutEditor from './layout-editor';

import './layout-editor.scss';

let cssHandler: CssHandler;

export interface LayoutEditorRootProps {
    value: any;
    breakpointsConfig: any;
    onChange: (payload: EditorPayload) => void;
}

function getRawCss(layoutKey: string, container: any) {
    const layoutSelector = `.spdlayout-container.layout-${layoutKey}`;
    return cssHandler.getRawCss(layoutSelector, container);
}

function getInitialData() {
    const key = generateSalt(9);
    const container = {
        breakpoints: { 
            default: {}, 
            mobile: {}, 
            tablet: {}, 
            desktop: {}
        }
    }

    return {
        key,
        container,
        containerRawCss: getRawCss(key, container),
    };
}

export default function LayoutEditorRoot({ value, breakpointsConfig, onChange } : LayoutEditorRootProps) {
    if(!cssHandler) {
        cssHandler = new CssHandler(breakpointsConfig);
    }

    if (!value) {
        value = getInitialData();
    }

    const [container, setContainer] = useState(value.container);
    const [currentBreakpoint, setCurrentBreakpoint] = useState('default');

    function handleValueChange(propertyName: string, propertyValue: any) {
        container.breakpoints[currentBreakpoint][propertyName] = propertyValue;
        setContainer(cloneDeep(container));

        const newValue = assign(
            value,
            {
                container,
                containerRawCss: getRawCss(value.key, container),
            }
        )
        
        onChange({ value: newValue })
    }

    return <LayoutEditor 
        container={container}
        currentBreakpoint={currentBreakpoint}
        onChange={handleValueChange}
        onBreakpointChange={setCurrentBreakpoint}
    />;
}
