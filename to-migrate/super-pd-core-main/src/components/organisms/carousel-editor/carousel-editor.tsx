import BreakPointSelector from 'src/components/molecules/breakpoint-selector/breakpoint-selector';
import NumberInput from 'src/components/atoms/number-input/number-input';
import Toggle from 'src/components/atoms/toggle/toggle';
import PickList from 'src/components/atoms/pick-list/pick-list';

import NumberOfSlidesSelector from './number-of-slides-selector/number-of-slides-selector';
import AutoPlayControl from './auto-play-control/auto-play-control';

import styles from './carousel-studio.module.scss';


interface CarouselEditorProps {
    carousel: any;
    currentBreakpoint: string;
    onChange: (propertyName: string, value: any, isResponsive?: boolean) => void,
    onBreakpointChange: (breakpoint: string) => void
}

export default function CarouselEditor({ 
    carousel,
    currentBreakpoint,
    onChange,
    onBreakpointChange
} : CarouselEditorProps) {

    function getValue(propertyName: string, isResponsive?: boolean) {
        if (!isResponsive || currentBreakpoint === 'default') {
            return carousel[propertyName] || '';
        }

        return carousel.breakpoints[currentBreakpoint][propertyName] || '';
    }

    function handleEffectChange(effect: string) {
        if (effect === 'fade') {
            onChange('fadeEffect', { crossFade: true });
        } else {
            onChange('fadeEffect', null);
        }
        onChange('effect', effect);
    }

    return (
        <div style={{ backgroundColor: 'white' }}>
            <div className={styles.attributesGroup}>
                <div className="slds-m-bottom_x-small">
                    <PickList
                        name="Slider Effect"
                        value={getValue('effect')}
                        onChange={handleEffectChange}
                        options={[
                            { value: 'slide', label: 'Slide' },
                            { value: 'fade', label: 'Fade' },
                        ]}
                    />
                </div>
                <Toggle
                    name="Infinite Loop ?"
                    checked={getValue('loop')}
                    onChange={(value) => onChange('loop', value)}
                />
            </div>
            <hr className="slds-m-vertical_small" />
            <BreakPointSelector
                value={currentBreakpoint}
                onChange={onBreakpointChange}
                excludeBreakpoints={['mobile']}
            />
            <div className="slds-m-bottom_x-small">
                <NumberInput
                    name="Gap Between Slides"
                    value={getValue('spaceBetween', true)}
                    onChange={(value) => onChange('spaceBetween', value, true)}
                />
            </div>
            <div className="slds-m-bottom_x-small">
                <NumberOfSlidesSelector
                    name="Number of Slides shown"
                    value={getValue('slidesPerView', true)}
                    onChange={(value) => onChange('slidesPerView', value, true)}
                />
            </div>
            <div className="slds-m-bottom_x-small">
                <AutoPlayControl
                    name="Auto Play"
                    value={getValue('autoplay', true)}
                    onChange={(value) => onChange('autoplay', value, true)}
                />
            </div>
            <div className="slds-m-bottom_x-small">
                <Toggle
                    name="Center Active Slide ?"
                    checked={getValue('centeredSlides', true) || false}
                    onChange={(value) => onChange('centeredSlides', value, true)}
                />
            </div>
        </div>
    );
}
