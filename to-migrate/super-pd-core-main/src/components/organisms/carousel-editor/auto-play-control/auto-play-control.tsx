import { useEffect, useState } from 'react';
import Switch from 'react-switch';

import NumberInput from 'src/components/atoms/number-input/number-input';

import styles from './auto-play-control.module.scss';

type AutoPlayConfig = { delay: number } | null;

interface AutoPlayControlProps {
    name: string;
    value: AutoPlayConfig,
    onChange: (value: AutoPlayConfig) => void,
}

export default function AutoPlayControl({ name, value, onChange} : AutoPlayControlProps) {
    const [autoPlay, setAutoPlay] = useState(!!value);

    useEffect(() => {
        setAutoPlay(!!value);
    }, [value]);

    function handleToggleChange(checkboxStatus: boolean) {
        setAutoPlay(checkboxStatus);
        onChange(checkboxStatus ? { delay: 3000 } : null);
    }

    function handleValueChange(value: number) {
        onChange(value ? { delay: value } : null);
    }

    return (
        <>
            <div className={`${styles.autoContainer}`}>
                <label className="slds-form-element__label" htmlFor={name}>
                    {name}
                </label>
                <div className={styles.switchContainer}>
                    <Switch
                        uncheckedIcon={false}
                        checkedIcon={false}
                        checked={autoPlay}
                        onChange={handleToggleChange}
                        onColor="#86d3ff"
                        onHandleColor="#2693e6"
                        height={20}
                        width={40}
                    />
                </div>
            </div>

            {autoPlay && (
                <NumberInput
                    name={'Delay'}
                    hideLabel={true}
                    value={value?.delay}
                    onChange={handleValueChange}
                />
            )}
        </>
    );
}
