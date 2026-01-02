import React from 'react';

interface PickListOption {
    label: string;
    value: string;
}

interface PickListProps {
    name: string;
    value: string;
    onChange: (a: string) => void;
    options: PickListOption[]
}

export default function PickList({ 
    name,
    value,
    onChange,
    options = []
} : PickListProps) {
    const optionsElements = options.map((option) => {
        return (
            <option key={option.value} value={option.value}>
                {option.label}
            </option>
        );
    });

    function handleValueChange(event: React.ChangeEvent<HTMLSelectElement>) {
        onChange(event.target.value);
    }

    return (
        <div className={`slds-form-element`}>
            <label className="slds-form-element__label">{name}</label>
            <div className="slds-form-element__control slds-grid">
                <select
                    onChange={handleValueChange}
                    value={value}
                    className="slds-input"
                    id=""
                >
                    <option value="" disabled>{name}</option>
                    {optionsElements}
                </select>
            </div>
        </div>
    );
}
