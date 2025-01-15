'use client';

import { IoBagAdd } from 'react-icons/io5';
import styles from '@styles/componentStyles/create-schedule/BaggageList.module.scss';

type PackingItemListProps = {
    items: string[];
    onClose: () => void;
};

export default function PackingItemList({ items, onClose }: PackingItemListProps) {
    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.closeBtn} onClick={onClose}>
                    ✕
                </div>
                <div className={styles.titleRow}>
                    <IoBagAdd className={styles.icon} />
                    <span className={styles.title}>持ち物リスト</span>
                </div>
            </div>

            <div className={styles.body}>
                {items.length > 0 ? (
                    <ul className={styles.list}>
                        {items.map((item) => (
                            <li key={item} className={styles.listItem}>
                                <span className={styles.bullet} />
                                <span className={styles.itemText}>{item}</span>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className={styles.noItems}>持ち物がありません</p>
                )}
            </div>
        </div>
    );
}
