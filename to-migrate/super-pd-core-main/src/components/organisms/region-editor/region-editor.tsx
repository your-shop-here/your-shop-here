import { isNil } from 'lodash';

import DimensionSelector from 'src/components/molecules/dimension-selector/dimension-selector';
import FourDimensionSelector from 'src/components/molecules/four-dimension-selector/four-dimension-selector';
import ColorPicker from 'src/components/molecules/color-picker/color-picker';
import BreakPointSelector from 'src/components/molecules/breakpoint-selector/breakpoint-selector';
import NumberInput from 'src/components/atoms/number-input/number-input';
import BackgroundSettings from 'src/components/molecules/background-settings/background-settings';

import styles from './region-editor.module.scss';

interface RegionEditorProps {
    region: any;
    currentBreakpoint: string;
    onChange: (propertyName: string, value: any) => void,
    onBreakpointChange: (breakpoint: string) => void
}

export default function RegionEditor({
    region,
    currentBreakpoint,
    onChange,
    onBreakpointChange,
} : RegionEditorProps) {

    function getPropertyValue(propertyName: string, defaultValue?: any) {
        if (!region) return;

        let value = region.breakpoints[currentBreakpoint][propertyName];

        if (isNil(value) && defaultValue) {
            value = defaultValue;
        }

        return value;
    }

    return (
        <div className={`${styles.regionEditor}`}>
            <BreakPointSelector value={currentBreakpoint} onChange={onBreakpointChange} />
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
            <div className="slds-m-bottom_small">
                <FourDimensionSelector
                    name="Padding"
                    value={getPropertyValue('padding')}
                    onChange={(value) => onChange('padding', value)}
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
                <ColorPicker
                    name="Text Color"
                    value={getPropertyValue('color')}
                    onChange={(value) => onChange('color', value)}
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
                <FourDimensionSelector
                    name="Border Radius"
                    value={getPropertyValue('borderRadius')}
                    onChange={(value) => onChange('borderRadius', value)}
                />
            </div>
            <BackgroundSettings value={getPropertyValue} onChange={onChange} />
            <div className="slds-m-bottom_small">
                <NumberInput
                    name="Order"
                    onChange={(value) => onChange('order', value)}
                    value={getPropertyValue('order')}
                />
            </div>
        </div>
    );
}
