import { useDispatch } from 'react-redux';
import { useAppSelector } from '../../redux/store-hooks';

import { toggleEditor } from '../../redux/manager-slice';
import { setCurrentImage } from '../../redux/image-slice';

import styles from './image-holder.module.scss';

interface ImageHolderProps {
    image: ImageObject
}

export default function ImageHolder({ image } : ImageHolderProps ) {
    const { url, name, path } = image;
    const currentImagePath = useAppSelector((state) => state.image.path);

    const dispatch = useDispatch();

    function handleEditClick() {
        dispatch(toggleEditor());
    }

    function handleHolderClick() {
        dispatch(setCurrentImage(path));
    }

    function getIsActiveClass() {
        return currentImagePath == path ? styles.active : '';
    }

    return (
        <div onClick={handleHolderClick} className={styles.imageHolder}>
            <div className={`${styles.detailsContainer} ${getIsActiveClass()}`}>
                <div className={styles.imageContainer}>
                    <img src={url} loading="lazy" alt="" />
                </div>
                <div className={styles.nameContainer}>{name}</div>
            </div>
            <div className={styles.actionsBlock}>
                <i onClick={handleEditClick} className="fas fa-edit"></i>
            </div>
        </div>
    );
}
