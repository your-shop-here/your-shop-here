import styles from './folders.module.scss';
import { NodeRendererProps } from 'react-arborist';

export default function FolderNode({ node, style, dragHandle } : NodeRendererProps<any>) {
    function handleChevronClick() {
        node.toggle();
    }

    function nodeHasChildren() {
        return node.children && node.children.length;
    }

    return (
        <div className={styles.folderNode} style={style} ref={dragHandle}>
            {nodeHasChildren() && (
                <div
                    className={`${styles.folderChevron} ${
                        node.isOpen ? styles.folderOpen : ''
                    }`}
                    onClick={handleChevronClick}
                >
                    <i className="fa fa-chevron-right"></i>
                </div>
            )}
            <div className={styles.folderName}>{node.data.name}</div>
        </div>
    );
}
