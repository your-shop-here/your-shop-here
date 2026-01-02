import { configureStore, createListenerMiddleware } from '@reduxjs/toolkit';
import { concat } from 'lodash';

import imagesManagerSlice from './manager-slice';
import imageSlice from './image-slice';
import { imagesManagerClient } from './images-manager-client';

// Create the middleware instance and methods
const listenerMiddleware = createListenerMiddleware()

export const imagesMangerStore = configureStore({
    reducer: {
        [imagesManagerClient.reducerPath]: imagesManagerClient.reducer,
        manager: imagesManagerSlice,
        image: imageSlice,
    },
    middleware: (getDefaultMiddleware) => {
        return concat(listenerMiddleware.middleware, getDefaultMiddleware(), imagesManagerClient.middleware);
    },
});

export type ManagerDispatch = typeof imagesMangerStore.dispatch
export type ManagerState = ReturnType<typeof imagesMangerStore.getState>
