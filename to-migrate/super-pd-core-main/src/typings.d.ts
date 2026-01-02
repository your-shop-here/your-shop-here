declare module '*.module.scss';
declare module 'react-range-slider-input';

type EditorPayload = {
    value: any;
    [key: string]: any
}

type Directions = 'top' | 'right' | 'bottom' | 'left';

interface Measurement {
    value: string | number;
    unit: string;
}

interface FourDimensionMeasurement {
    top: Measurement;
    right: Measurement;
    bottom: Measurement;
    left: Measurement;
}

interface Size {
    height: Measurement;
    width: Measurement;
}

interface BorderConfig {
    color: string;
    width: FourDimensionMeasurement;
    style: string;
    radius: Measurement;
}

interface CropData {
    x: number;
    y: number;
    height: number;
    width: number;
}

interface ImageObject {
    url: string;
    name: string;
    path: string;
}

declare module '@myassir/react-color'
{
    export * from 'react-color';
}