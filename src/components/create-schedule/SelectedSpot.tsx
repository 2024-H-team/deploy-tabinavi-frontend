'use client';
import styles from '@styles/componentStyles/create-schedule/SelectedSpot.module.scss';
import { PlaceDetails } from '@/types/PlaceDetails';
import WheelPicker from '@/components/WheelPicker';

const hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
const minutes = Array.from({ length: 12 }, (_, i) => (i * 5).toString().padStart(2, '0'));

interface SelectedSpotProps {
    onDelete: () => void;
    spot: PlaceDetails;
    onStayTimeUpdate: (spotName: string, stayTime: { hour: string; minute: string }) => void;
    dragHandleProps?: React.HTMLAttributes<HTMLDivElement>;
    isDragging?: boolean;
}

export default function SelectedSpot({
    spot,
    onDelete,
    onStayTimeUpdate,
    dragHandleProps,
    isDragging,
}: SelectedSpotProps) {
    const defaultHour = spot.stayTime?.hour || '00';
    const defaultMinute = spot.stayTime?.minute || '00';

    const handleTimeChange = (newHour: string, newMinute: string) => {
        onStayTimeUpdate(spot.name, { hour: newHour, minute: newMinute });
    };
    const truncateText = (text: string, maxLength: number = 15) => {
        return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
    };

    return (
        <div
            className={styles.spot}
            style={{
                border: isDragging ? '2px solid green' : '',
            }}
        >
            <div className={styles.spotInfo}>
                <div className={styles.dragHolder} {...dragHandleProps}>
                    =
                </div>
                <div>
                    <h3 title={spot.name}>{truncateText(spot.name)}</h3>
                </div>
                <div className={styles.closeBtn} onClick={onDelete}>
                    ✕
                </div>
            </div>
            <div className={styles.timePickerGroup}>
                <p>滞在時間</p>
                <div className={styles.pickers}>
                    <WheelPicker
                        data={hours}
                        defaultSelection={hours.indexOf(defaultHour)}
                        onChange={(value) => {
                            handleTimeChange(value, defaultMinute);
                        }}
                    />
                    <WheelPicker
                        data={minutes}
                        defaultSelection={minutes.indexOf(defaultMinute)}
                        onChange={(value) => {
                            handleTimeChange(defaultHour, value);
                        }}
                    />
                </div>
            </div>
        </div>
    );
}
