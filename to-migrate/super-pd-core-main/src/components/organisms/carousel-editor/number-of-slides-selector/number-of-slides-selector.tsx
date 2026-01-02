import { useEffect, useState } from "react";
import Switch from "react-switch";

import NumberInput from "src/components/atoms/number-input/number-input";

import styles from "./number-of-slides-selector.module.scss"

type SlidesNumberValue = number | string | undefined;

interface NumberOfSlidesSelector {
    name: string;
    value: SlidesNumberValue;
    onChange: (value: SlidesNumberValue) => void
}

export default function NumberOfSlidesSelector({ name, value , onChange} : NumberOfSlidesSelector) {
    const [autoWidth, setAutoWidth] = useState(!!value);

    useEffect(() => {
        setAutoWidth(value === 'auto')
    }, [value])

    function handleAutoModeChange(checkboxStatus : boolean) {
        setAutoWidth(checkboxStatus)
        if (checkboxStatus) {
            onChange('auto');
        } else {
            onChange(1);
        }
    }

    function handleValueChange(value: SlidesNumberValue) {
        onChange(value);
    }

    return <>
        <div className={`${styles.autoContainer}`}>
            <label className="slds-form-element__label" htmlFor={name}>
                {name}
            </label>
            <div className={styles.switchContainer}>
                <label className="slds-form-element__label">
                    Auto:
                </label>
                <Switch 
                    uncheckedIcon={false}
                    checkedIcon={false}
                    checked={autoWidth}
                    onChange={handleAutoModeChange}
                    onColor="#86d3ff"
                    onHandleColor="#2693e6"
                    height={20}
                    width={40}
                />
            </div>
        </div>

        {!autoWidth &&
            <NumberInput 
                name={name}
                hideLabel={true}
                value={value as number}
                onChange={handleValueChange}
            />
        }
    </>
}
