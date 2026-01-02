import { useEffect, useRef } from 'react';
import { NodeApi, Tree, TreeApi } from 'react-arborist';
import { useDispatch } from 'react-redux';

import LoadingSpinner from 'src/components/atoms/loading-spinner/loading-spinner';

import { useGetLibraryFoldersQuery } from '../redux/images-manager-client';
import { setCurrentFolder } from '../redux/manager-slice';
import FolderNode from './folder-node';

interface FoldersTreeProps {
    height: number | undefined;
    currentFolder: string;
}

export default function FoldersTree({ height, currentFolder } : FoldersTreeProps) {
    const dispatch = useDispatch();
    const { data, isLoading } = useGetLibraryFoldersQuery();
    const treeRef = useRef<TreeApi<any>>(null);

    useEffect(() => {
        const tree = treeRef.current;
        if (tree && data && currentFolder) {
            tree.open(currentFolder);
        }
    }, [treeRef.current, data]);

    if (isLoading || !data) {
        return <LoadingSpinner />;
    }

    function handleFolderActivation(folder : NodeApi) {
        dispatch(setCurrentFolder(folder.id));
    }

    return (
        <Tree
            selection={currentFolder}
            openByDefault={false}
            onActivate={handleFolderActivation}
            disableDrag
            rowClassName="folder-row"
            rowHeight={30}
            initialData={data}
            disableMultiSelection
            ref={treeRef}
            height={height}
        >
            {FolderNode}
        </Tree>
    );
}
