import { useEffect } from 'react';

import { useLazyGetFolderImagesQuery } from '../redux/images-manager-client';
import ImageHolder from './image-holder/image-holder';
import LoadingSpinner from 'src/components/atoms/loading-spinner/loading-spinner';

interface ImagesListProps {
    currentFolder: string;
}

export default function ImagesList({ currentFolder } : ImagesListProps) {
    const [getImages, { data, isFetching, isUninitialized }] =
        useLazyGetFolderImagesQuery();

    useEffect(() => {
        if (currentFolder) {
            getImages(currentFolder);
        }
    }, [currentFolder]);

    if (isFetching || isUninitialized) {
        return <LoadingSpinner />;
    }

    const images = data.map((image: ImageObject, index: number) => {
        return <ImageHolder key={index} image={image} />;
    });

    return <>{images}</>;
}
