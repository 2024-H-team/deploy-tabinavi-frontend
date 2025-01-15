'use client';
import styles from '@styles/componentStyles/create-schedule/PreviewSpotItem.module.scss';
import { PlaceDetails } from '@/types/PlaceDetails';
import { GrNext } from 'react-icons/gr';
import { useRouter } from 'next/navigation';

const truncateName = (name: string, maxLength: number = 15) => {
    return name.length > maxLength ? `${name.slice(0, maxLength)}...` : name;
};
const hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
const minutes = Array.from({ length: 12 }, (_, i) => (i * 5).toString().padStart(2, '0'));

interface SchedulePreviewSpotItemProps {
    spot: PlaceDetails;
    dragHandleProps?: React.HTMLAttributes<HTMLDivElement>;
    onDelete: () => void;
    isDragging?: boolean;
}

export default function SchedulePreviewSpotItem({
    spot,
    dragHandleProps,
    onDelete,
    isDragging,
}: SchedulePreviewSpotItemProps) {
    const router = useRouter();
    const hour = spot.stayTime?.hour || hours[0];
    const minute = spot.stayTime?.minute || minutes[0];

    const handleEdit = () => {
        sessionStorage.setItem('editSpot', JSON.stringify(spot));
        router.push('/edit');
    };
    return (
        <div
            className={styles.PreviewSpotItem}
            style={{
                border: isDragging ? '2px solid green' : '1px solid #ccc',
            }}
        >
            <div className={styles.spotInfo}>
                <div className={styles.stayTime}>
                    <p>滞在時間:{`${hour}時間${minute}分`}</p>
                </div>
                <h2 title={spot.name}>{truncateName(spot.name)}</h2>
            </div>
            <div className={styles.packingList}>
                <div className={styles.packingList}>
                    {spot.packingList?.map((item, index) => (
                        <div key={index} className={styles.item}>
                            {item}
                        </div>
                    ))}
                </div>
            </div>
            <div className={styles.dragHolder} {...dragHandleProps}>
                =
            </div>
            <div className={styles.bar}></div>
            <div className={styles.closeBtn} onClick={onDelete}>
                ✕
            </div>
            <div className={styles.spotEdit} onClick={handleEdit}>
                <GrNext size={20} />
            </div>
        </div>
    );
}
