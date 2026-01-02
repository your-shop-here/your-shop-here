import useResizeObserver from 'use-resize-observer';

import { useAppSelector } from './redux/store-hooks';
import ImagesList from './images-list/images-list';
import ImagesEditor from './images-editor/images-editor';
import LeftPanel from './left-panel/left-panel';

import styles from './image-picker.module.scss';

export default function ImagePicker() {
    const { ref, height } = useResizeObserver();
    const isEditorActive = useAppSelector((state) => state.manager.isEditorActive);
    const currentFolder = useAppSelector((state) => state.manager.currentFolder);
    const currentImagePath = useAppSelector((state) => state.image.path);

    return (
        <>
            {isEditorActive && <ImagesEditor currentImagePath={currentImagePath} />}
            <div className={styles.rightPanel}>
                <ImagesList currentFolder={currentFolder} />
            </div>
            <div className={styles.leftPanel} ref={ref}>
                <LeftPanel height={height} currentFolder={currentFolder} />
            </div>
        </>
    );
}
