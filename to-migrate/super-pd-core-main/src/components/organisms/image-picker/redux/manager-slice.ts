import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    currentFolder: 'default',
    isEditorActive: false,
    currentEditorPage: 'home',
};

export const imagesManagerSlice = createSlice({
    name: 'manager',
    initialState,
    reducers: {
        setCurrentFolder: (state, action) => {
            state.currentFolder = action.payload;
        },
        toggleEditor: (state) => {
            state.isEditorActive = !state.isEditorActive;
        },
        setEditorPage: (state, action) => {
            state.currentEditorPage = action.payload;
        },
    },
});

export const { setCurrentFolder, toggleEditor, setEditorPage } =
    imagesManagerSlice.actions;

export default imagesManagerSlice.reducer;
