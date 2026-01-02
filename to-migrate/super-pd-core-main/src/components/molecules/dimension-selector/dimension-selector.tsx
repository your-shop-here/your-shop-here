import React from 'react';
import styles from './dimension-selector.module.scss';

interface DimensionSelectorProps {
    name: string;
    measurement: Measurement;
    onChange: (a: Measurement) => void;
    className?: string;
    inputOnly?: boolean;
    readOnly?: boolean;
}

export default function DimensionSelector({
        name,
        measurement = { value: '', unit: 'px' },
        className,
        inputOnly = false,
        readOnly = false,
        onChange,
}: DimensionSelectorProps) {
    function handleUnitChange(event: React.ChangeEvent<HTMLSelectElement>) {
        measurement.unit = event.target.value;

        if (onChange) {
            onChange(measurement);
        }
    }

    function handleValueChange(event: React.ChangeEvent<HTMLInputElement>) {
        measurement.value = event.target.value;

        if (onChange) {
            onChange(measurement);
        }
    }

    return (
        <div className={`slds-form-element ${className || ''}`}>
            {!inputOnly && (
                <label className="slds-form-element__label" htmlFor={name}>
                    {name}
                </label>
            )}
            <div className={styles.inputContainer}>
                <input
                    type="text"
                    id={name}
                    value={measurement.value}
                    placeholder={name}
                    autoComplete="off"
                    onChange={handleValueChange}
                    readOnly={readOnly}
                />
                <select
                    value={measurement.unit}
                    onChange={handleUnitChange}
                    disabled={readOnly}
                >
                    <option value="px">px</option>
                    <option value="%">%</option>
                    <option value="vh">vh</option>
                    <option value="vw">vw</option>
                </select>
            </div>
        </div>
    );
}
