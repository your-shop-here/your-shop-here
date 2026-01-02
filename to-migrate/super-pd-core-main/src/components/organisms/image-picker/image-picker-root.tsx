import { useEffect, useState } from 'react';
import { Provider } from 'react-redux';

import ImagePicker from './image-picker';
import { imagesMangerStore } from './redux/store';
import { addAppListener } from './redux/listener-middleware';
import imgManagerHelpers from './img-manager-helpers';

import styles from './image-picker.module.scss';

type ImagePickerRootProps = {
    onChange: (payload: EditorPayload) => void;
    onValidationChange: (payload: boolean) => void;
}

export default function ImagePickerRoot({ onChange, onValidationChange } : ImagePickerRootProps) {
    const topWindow = window.top || window;
    const [windowHeight, setWindowHeight] = useState(topWindow.innerHeight);

    function handleWindowResize(event: Event) {
        const target = event.target as Window;
        setWindowHeight(target.innerHeight);
    }

    useEffect(() => {
        topWindow.addEventListener('resize', handleWindowResize);

        return () => {
            topWindow.removeEventListener('resize', handleWindowResize);
        };
    }, []);

    // 214 is the vertical spacing between the window and the editor container in PD
    const containerHeight = windowHeight - 214;

    // Attach image data change listener
    imagesMangerStore.dispatch(addAppListener({
        effect: async (_action, listenerApi) => {
            const { image } = listenerApi.getState();
            const imageFinalURL = imgManagerHelpers.getFinalURL(image.path, image.cropData, image.quality);
            onChange({ value: imageFinalURL });
        },
        predicate: (action) => {
            return action.type.startsWith('image')
        },
    }))
    
    // Attach editor's current page change listener
    imagesMangerStore.dispatch(addAppListener({
        effect: async (_action, listenerApi) => {
            const { manager } = listenerApi.getState();
            onValidationChange(manager.currentEditorPage != 'crop')
        },
        predicate: (action) => {
            return action.type == 'manager/setEditorPage'
        },
    }))

    return (
        <Provider store={imagesMangerStore}>
            <div className={styles.imagePickerRoot} style={{ height: containerHeight }}>
                <ImagePicker />
            </div>
        </Provider>
    );
}
