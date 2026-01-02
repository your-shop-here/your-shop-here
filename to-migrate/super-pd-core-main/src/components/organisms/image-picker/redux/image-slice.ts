import { createSlice } from '@reduxjs/toolkit';
import { clone } from 'lodash';

const initialState = {
    path: '',
    cropData: undefined,
    quality: 100,
    tempCropData: undefined
};

export const imageSlice = createSlice({
    name: 'image',
    initialState,
    reducers: {
        setCurrentImage: (state, action) => {
            state.path = action.payload;
            state.cropData = undefined;
        },
        setTempCropData: (state, action) => {
            state.tempCropData = action.payload;
        },
        saveCropData: (state) => {
            state.cropData = clone(state.tempCropData);
            state.tempCropData = undefined;
        },
        setQuality: (state, action) => {
            state.quality = action.payload;
        },
        resetImage: (state) => {
            state.quality = 100;
            state.cropData = undefined;
        },
    },
});

export const { setCurrentImage, setTempCropData, saveCropData, setQuality, resetImage } =
    imageSlice.actions;

export default imageSlice.reducer;
