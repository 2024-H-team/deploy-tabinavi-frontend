'use client';

import { IoBagAdd } from 'react-icons/io5';
import styles from '@styles/componentStyles/create-schedule/BaggageList.module.scss';

type PackingItemListProps = {
    items: string[];
    onClose: () => void;
};

export default function PackingItemList({ items, onClose }: PackingItemListProps) {
    const itemCounts = items.reduce((acc: Record<string, number>, item) => {
        acc[item] = (acc[item] || 0) + 1;
        return acc;
    }, {});

    const uniqueItems = Object.entries(itemCounts);

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
                {uniqueItems.length > 0 ? (
                    <ul className={styles.list}>
                        {uniqueItems.map(([item, count]) => (
                            <li key={item} className={styles.listItem}>
                                <span className={styles.bullet} />
                                <span className={styles.itemText}>
                                    {item}
                                    {count > 1 ? ` x${count}` : ''}
                                </span>
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
