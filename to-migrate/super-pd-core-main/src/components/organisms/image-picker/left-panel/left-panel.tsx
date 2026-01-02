import { useRef } from 'react';

import FoldersTree from '../folders-tree/folders-tree';
import { useUploadImageMutation } from '../redux/images-manager-client';
import LoadingSpinner from 'src/components/atoms/loading-spinner/loading-spinner';

import styles from './left-panel.module.scss';

interface LeftPanelProps {
    height: number | undefined;
    currentFolder: string;
}

export default function LeftPanel({ height, currentFolder } : LeftPanelProps) {
    const uploadFormRef = useRef<HTMLFormElement>(null);
    const [uploadImage, { isLoading }] = useUploadImageMutation();

    function handleFileChange() {
        const formElement = uploadFormRef.current;

        if (!formElement) return;

        const formData = new FormData(formElement);
        uploadImage({
            folderPath: currentFolder,
            data: formData,
        });
    }

    if (isLoading) {
        return <LoadingSpinner />;
    }

    return (
        <>
            <div className={styles.uploadContainer}>
                <label className="slds-button slds-button_neutral slds-button_stretch">
                    Upload Image
                    <form method="post" encType="multipart/form-data" ref={uploadFormRef}>
                        <input
                            onChange={handleFileChange}
                            accept="image/*"
                            type="file"
                            name="file"
                            hidden
                        />
                    </form>
                </label>
            </div>
            <FoldersTree height={height} currentFolder={currentFolder} />
        </>
    );
}
