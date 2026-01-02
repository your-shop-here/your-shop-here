import { useAppSelector } from '../redux/store-hooks';

import ControlPanel from './control-panel';
import ImageCrop from './image-crop/image-crop';
import ImgEditorHeader from './img-editor-header/img-editor-header';
import imgManagerHelpers from '../img-manager-helpers';

import styles from './images-editor.module.scss';

interface ImagesEditorProps {
    currentImagePath: string
}

export default function ImagesEditor({ currentImagePath } : ImagesEditorProps) {
    const currentEditorPage = useAppSelector((state) => state.manager.currentEditorPage);
    const cropData = useAppSelector((state) => state.image.cropData);
    const quality = useAppSelector((state) => state.image.quality);

    const finalURL = imgManagerHelpers.getFinalURL(currentImagePath, cropData, quality);

    return (
        <div className={styles.imagesEditorContainer}>
            <ImgEditorHeader />
            <div className={styles.editorLayout}>
                <div className={styles.editorPreview}>
                    {currentEditorPage == 'crop' && (
                        <ImageCrop imagePath={currentImagePath} />
                    )}
                    {currentEditorPage == 'home' && (
                        <div
                            className={styles.imagePreview}
                            style={{
                                backgroundImage: `url("${finalURL}")`,
                            }}
                        ></div>
                    )}
                </div>
                {currentEditorPage == 'home' && <ControlPanel /> }
            </div>
        </div>
    );
}
