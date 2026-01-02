import ImageInput from 'src/components/atoms/image-input/image-input';
import PickList from 'src/components/atoms/pick-list/pick-list';
import Toggle from 'src/components/atoms/toggle/toggle';

interface BackgroundSettingsProps {
    value: (a: string, isResponsive?: boolean) => any;
    onChange: (a: string, b: any) => void;
}

export default function BackgroundSettings({ value, onChange } : BackgroundSettingsProps) {
    return (
        <>
            <div className="slds-m-bottom_small">
                <ImageInput
                    name="Background Image"
                    onChange={(payload) => onChange('backgroundImage', payload.value)}
                    value={value('backgroundImage')}
                />
            </div>
            <div className="slds-m-bottom_small">
                <Toggle
                    name="Background Repeat"
                    checked={value('backgroundRepeat', true)}
                    onChange={(value) => onChange('backgroundRepeat', value)}
                />
            </div>
            <div className="slds-m-bottom_small">
                <PickList
                    name="Background Size"
                    onChange={(value) => onChange('backgroundSize', value)}
                    value={value('backgroundSize')}
                    options={[
                        { label: 'Auto', value: 'auto' },
                        { label: 'Contain', value: 'contain' },
                        { label: 'Cover', value: 'cover' },
                    ]}
                />
            </div>
        </>
    );
}
