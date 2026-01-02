import { isNil } from 'lodash';

import BreakPointSelector from 'src/components/molecules/breakpoint-selector/breakpoint-selector';
import FourDimensionSelector from 'src/components/molecules/four-dimension-selector/four-dimension-selector';
import ColorPicker from 'src/components/molecules/color-picker/color-picker';
import AlignmentSelector from 'src/components/molecules/alignment-selector/alignment-selector';
import BackgroundSettings from 'src/components/molecules/background-settings/background-settings';
import DimensionSelector from 'src/components/molecules/dimension-selector/dimension-selector';

interface LayoutEditorProps {
    container: any;
    currentBreakpoint: string;
    onChange: (propertyName: string, value: any) => void,
    onBreakpointChange: (breakpoint: string) => void
}

export default function LayoutEditor({ 
    container,
    currentBreakpoint,
    onChange,
    onBreakpointChange
} : LayoutEditorProps) {

    function getPropertyValue(propertyName: string, defaultValue?: any) {
        let value = container.breakpoints[currentBreakpoint][propertyName];

        if (isNil(value) && defaultValue) {
            value = defaultValue;
        }

        return value;
    }

    return (
        <>
            <BreakPointSelector
                value={currentBreakpoint}
                onChange={onBreakpointChange}
            />
            <div className="slds-grid slds-m-bottom_small">
                <DimensionSelector
                    name="Width"
                    className="slds-m-right_x-small"
                    measurement={getPropertyValue('width')}
                    onChange={(value) => onChange('width', value)}
                />
                <DimensionSelector
                    name="Height"
                    measurement={getPropertyValue('height')}
                    onChange={(value) => onChange('height', value)}
                />
            </div>
            <div className="slds-grid slds-m-bottom_small slds-grid_align-spread">
                <AlignmentSelector
                    name="Horizontal Alignment"
                    value={getPropertyValue('justifyContent')}
                    onChange={(value) => onChange('justifyContent', value)}
                    direction="horizontal"
                />
                <AlignmentSelector
                    name="Vertical Alignment"
                    value={getPropertyValue('alignItems')}
                    onChange={(value) => onChange('alignItems', value)}
                    direction="vertical"
                />
            </div>
            <div className="slds-m-bottom_small">
                <FourDimensionSelector
                    name="Margin"
                    value={getPropertyValue('margin')}
                    onChange={(value) => onChange('margin', value)}
                />
            </div>
            <div className="slds-m-bottom_small">
                <FourDimensionSelector
                    name="Padding"
                    value={getPropertyValue('padding')}
                    onChange={(value) => onChange('padding', value)}
                />
            </div>
            <div className="slds-m-bottom_small">
                <ColorPicker
                    name="Background Color"
                    value={getPropertyValue('backgroundColor')}
                    onChange={(value) => onChange('backgroundColor', value)}
                />
            </div>
            <div className="slds-m-bottom_small">
                <BackgroundSettings
                    value={getPropertyValue}
                    onChange={onChange}
                />
            </div>
        </>
    );
}
