'use client';
import { useState } from 'react';
import styles from '@styles/componentStyles/edit/Content.module.scss';
import { HiOutlinePencil } from 'react-icons/hi2';
import WheelPicker from '../WheelPicker';
import { PlaceDetails } from '@/types/PlaceDetails';
import { DaySchedule } from '@/app/create-schedule/page';

const hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
const minutes = Array.from({ length: 12 }, (_, i) => (i * 5).toString().padStart(2, '0'));

interface EditFieldTimeProps {
    title: string;
    spot: PlaceDetails;
}

export default function EditFieldTime({ title, spot }: EditFieldTimeProps) {
    const [showPicker, setShowPicker] = useState(false);
    const [hour, setHour] = useState(spot.stayTime?.hour || '0');
    const [minute, setMinute] = useState(spot.stayTime?.minute || '0');

    const updateStorages = (newHour: string, newMinute: string) => {
        const editSpot = JSON.parse(sessionStorage.getItem('editSpot') || '{}');
        editSpot.stayTime = { hour: newHour, minute: newMinute };
        sessionStorage.setItem('editSpot', JSON.stringify(editSpot));

        const schedules: DaySchedule[] = JSON.parse(sessionStorage.getItem('schedules') || '[]');
        schedules.forEach((schedule) => {
            schedule.spots = schedule.spots.map((s) =>
                s.placeId === spot.placeId ? { ...s, stayTime: { hour: newHour, minute: newMinute } } : s,
            );
        });
        sessionStorage.setItem('schedules', JSON.stringify(schedules));
        const editSchedules = sessionStorage.getItem('editSchedules');
        if (editSchedules) {
            sessionStorage.setItem('editSchedules', JSON.stringify(schedules));
        }
    };

    const handleTimeChange = (type: 'hour' | 'minute', value: string) => {
        if (type === 'hour') {
            setHour(value);
            updateStorages(value, minute);
        } else {
            setMinute(value);
            updateStorages(hour, value);
        }
    };

    return (
        <div className={styles.EditWrap}>
            <div className={styles.EditFieldWrap}>
                <h2>{title}</h2>
                {showPicker ? (
                    <div className={styles.timePickerContainer}>
                        <WheelPicker
                            data={hours}
                            defaultSelection={hours.indexOf(hour)}
                            onChange={(value) => handleTimeChange('hour', value)}
                        />
                        <span>時間</span>
                        <WheelPicker
                            data={minutes}
                            defaultSelection={minutes.indexOf(minute)}
                            onChange={(value) => handleTimeChange('minute', value)}
                        />
                        <span>分</span>
                        <button onClick={() => setShowPicker(false)}>確定</button>
                    </div>
                ) : (
                    <div className={styles.EditField}>{`${hour}時間${minute}分`}</div>
                )}
            </div>
            <button className={styles.EditBtn} onClick={() => setShowPicker(true)}>
                <HiOutlinePencil color="#929292" />
            </button>
        </div>
    );
}
