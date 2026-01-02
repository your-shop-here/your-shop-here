import { useState } from 'react';
import { assign, cloneDeep } from 'lodash';

import { generateSalt } from 'src/utilities';
import { CssHandler } from 'src/helpers';

import RegionEditor from './region-editor';

let cssHandler: CssHandler;

function getRawCss(layoutKey: string, container: any) {
    const layoutSelector = `.spdlayout-region.region-${layoutKey}`;
    return cssHandler.getRawCss(layoutSelector, container);
}

function getInitialData() {
    const key = generateSalt(9);
    const region = {
        breakpoints: { 
            default: {}, 
            mobile: {}, 
            tablet: {}, 
            desktop: {}
        }
    }

    return {
        key,
        region,
        regionsRawCss: getRawCss(key, region),
    };
}

export interface RegionEditorRootProps {
    value: any;
    breakpointsConfig: any;
    onChange: (payload: EditorPayload) => void;
}

export default function RegionEditorRoot({ 
    value,
    breakpointsConfig,
    onChange
} : RegionEditorRootProps) {
    cssHandler = new CssHandler(breakpointsConfig);
    if (!value) {
        value = getInitialData();
    }    

    const [region, setRegion] = useState(value.region);
    const [currentBreakpoint, setCurrentBreakpoint] = useState('default');

    function handleValueChange(propertyName: string, propertyValue: any) {
        region.breakpoints[currentBreakpoint][propertyName] = propertyValue;
        setRegion(cloneDeep(region));

        const newValue = assign(
            value,
            {
                region,
                regionRawCss: getRawCss(value.key, region),
            }
        )

        onChange({ value: newValue })
    }

    return (
        <RegionEditor
            region={region}
            currentBreakpoint={currentBreakpoint}
            onChange={handleValueChange}
            onBreakpointChange={setCurrentBreakpoint}
        />
    );
}
