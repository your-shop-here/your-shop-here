import { useState } from 'react';
import { cloneDeep } from 'lodash';

import CarouselEditor from './carousel-editor';

interface CarouselEditorRootProps {
    value: any;
    onChange: (payload: EditorPayload) => void;
}

const DEFAULT_VALUE = {
    loop: false,
    effect: 'slide',
    centeredSlides: false,
    spaceBetween: 0,
    slidesPerView: 'auto',
    breakpoints: {
        tablet: {},
        desktop: {},
    },
};

export default function CarouselEditorRoot({ value, onChange } : CarouselEditorRootProps) {
    if (!value) {
        value = JSON.stringify(DEFAULT_VALUE);
    }

    const [currentBreakpoint, setCurrentBreakpoint] = useState('default');
    const [carousel, setCarousel] = useState(JSON.parse(value));

    function handleChange(propertyName: string, value: any, isResponsive?: boolean) {
        if (!isResponsive || currentBreakpoint === 'default') {
            if (!value) {
                delete carousel[propertyName];
            } else {
                carousel[propertyName] = value;
            }
        } else {
            if (!value) {
                delete carousel.breakpoints[currentBreakpoint][propertyName];
            } else {
                carousel.breakpoints[currentBreakpoint][propertyName] = value;
            }
        }

        setCarousel(cloneDeep(carousel));
        onChange({ value: JSON.stringify(carousel) })
    }

    return (
        <CarouselEditor 
            carousel={carousel}
            currentBreakpoint={currentBreakpoint}
            onChange={handleChange}
            onBreakpointChange={setCurrentBreakpoint}
        />
    )
}
