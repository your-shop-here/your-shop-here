import DimensionSelector from '../dimension-selector/dimension-selector';

const DEFAULT_VALUE = {
    height: { value: 100, unit: 'px' },
    width: { value: 200, unit: 'px' },
};

interface SizeSelectorProps {
    value: Size,
    onChange: (a: Size) => void
}

export default function SizeSelector({ value = DEFAULT_VALUE, onChange } : SizeSelectorProps) {
    function handleChange(property: string, newValue: Measurement) {
        const updatedValue = {
            ...value,
            [property]: newValue,
        };
        onChange(updatedValue);
    }

    return (
        <div className="slds-grid slds-gutters">
            <div className="slds-col">
                <DimensionSelector
                    name="Height"
                    measurement={value.height}
                    onChange={(value) => handleChange('height', value)}
                />
            </div>
            <div className="slds-col">
                <DimensionSelector
                    name="Width"
                    measurement={value.width}
                    onChange={(value) => handleChange('width', value)}
                />
            </div>
        </div>
    );
}
