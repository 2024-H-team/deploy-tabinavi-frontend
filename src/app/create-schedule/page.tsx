'use client';
import { useState, useEffect } from 'react';
import WheelPicker from '@/components/WheelPicker';
import styles from '@styles/appStyles/schedule/InfoSetup.module.scss';
import { useRouter } from 'next/navigation';
import Footer from '@/components/Footer';
import { PlaceDetails } from '@/types/PlaceDetails';
import { BestRoute } from '@/types/TransferData';

const hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
const minutes = Array.from({ length: 12 }, (_, i) => (i * 5).toString().padStart(2, '0'));

export type TravelMode = 'WALKING' | 'DRIVING' | 'TRANSIT';

export interface TransportInfo {
    mode: TravelMode;
    duration: string;
    routeDetail?: BestRoute;
}

export interface DaySchedule {
    SchedulesID?: number;
    title?: string;
    date: string;
    startTime: string;
    endTime: string;
    spots: PlaceDetails[];
    transports: TransportInfo[];
}

export default function InfoSetup() {
    const [isOneDay, setIsOneDay] = useState(true);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [schedules, setSchedules] = useState<DaySchedule[]>([
        {
            date: '',
            startTime: `${hours[0]}:${minutes[0]}`,
            endTime: `${hours[0]}:${minutes[0]}`,
            spots: [],
            transports: [],
        },
    ]);
    const [title, setTitle] = useState('');
    const router = useRouter();

    const getDateRange = (start: string, end: string): string[] => {
        const startDt = new Date(start);
        const endDt = new Date(end);
        const dateArray: string[] = [];
        for (let dt = new Date(startDt); dt <= endDt; dt.setDate(dt.getDate() + 1)) {
            const year = dt.getFullYear();
            const month = (dt.getMonth() + 1).toString().padStart(2, '0');
            const day = dt.getDate().toString().padStart(2, '0');
            dateArray.push(`${year}-${month}-${day}`);
        }
        return dateArray;
    };

    useEffect(() => {
        if (isOneDay) {
            setSchedules([
                {
                    title,
                    date: startDate,
                    startTime: `${hours[0]}:${minutes[0]}`,
                    endTime: `${hours[0]}:${minutes[0]}`,
                    spots: [],
                    transports: [],
                },
            ]);
        } else if (startDate && endDate) {
            const dates = getDateRange(startDate, endDate);
            const newSchedules: DaySchedule[] = dates.map((date, index) => {
                let transports: TransportInfo[] = [];
                if (index < dates.length - 1) {
                    transports = [{ mode: 'WALKING', duration: '計算中', routeDetail: undefined }];
                }
                return {
                    title,
                    date,
                    startTime: `${hours[0]}:${minutes[0]}`, // Đảm bảo startTime luôn hợp lệ
                    endTime: index === dates.length - 1 ? `${hours[0]}:${minutes[0]}` : `${hours[23]}:${minutes[55]}`, // Đảm bảo endTime luôn hợp lệ
                    spots: [],
                    transports,
                };
            });
            setSchedules(newSchedules);
        }
    }, [isOneDay, startDate, endDate, title]);

    const handleTimeChange = (index: number, type: 'start' | 'end', value: string) => {
        setSchedules((prev) =>
            prev.map((schedule, i) => {
                if (i !== index) return schedule;

                const [hour, minute] = value.split(':');
                const formattedHour = hours.includes(hour) ? hour : hours[0];
                const formattedMinute = minutes.includes(minute) ? minute : minutes[0];
                const formattedTime = `${formattedHour}:${formattedMinute}`;

                return type === 'start'
                    ? { ...schedule, startTime: formattedTime }
                    : { ...schedule, endTime: formattedTime };
            }),
        );
    };

    const validateSchedules = () => {
        if (!title.trim()) {
            alert('タイトルを入力してください。');
            return false;
        }

        if (!startDate) {
            alert('開始日を選択してください。');
            return false;
        }

        if (!isOneDay && !endDate) {
            alert('終了日を選択してください。');
            return false;
        }

        for (const schedule of schedules) {
            if (!schedule.startTime || !schedule.endTime) {
                alert('すべてのスケジュールで出発時間と終了時間を設定してください。');
                return false;
            }
            if (schedule.startTime === schedule.endTime) {
                alert('出発時間と終了時間が同じです。');
                return false;
            }
            if (schedule.startTime > schedule.endTime) {
                alert('出発時間は終了時間より前である必要があります。');
                return false;
            }
        }

        return true;
    };

    const handleSubmit = () => {
        if (!validateSchedules()) return;

        sessionStorage.setItem('schedules', JSON.stringify(schedules));
        sessionStorage.removeItem('editSchedules');
        sessionStorage.removeItem('editSpot');
        sessionStorage.removeItem('transferData');
        router.push('/create-schedule/select-spot');
    };

    return (
        <>
            <div className={styles.infoSetup}>
                <h2>新しいスケジュール</h2>
                <div className={styles.titleBox}>
                    <p>タイトル：</p>
                    <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} />
                </div>
                <div className={styles.toggleGroup}>
                    <span className={styles.toggleLabel}>日帰り</span>
                    <label className={styles.switch}>
                        <input type="checkbox" checked={isOneDay} onChange={(e) => setIsOneDay(e.target.checked)} />
                        <span className={styles.slider}></span>
                    </label>
                </div>
                <div className={styles.datePickerContainer}>
                    <div className={styles.datePickerGroup}>
                        <p className={styles.dateText} data-checked={isOneDay}></p>
                        <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                    </div>
                    {!isOneDay && (
                        <div className={styles.datePickerGroup}>
                            <p>終了日</p>
                            <input
                                type="date"
                                value={endDate}
                                min={startDate}
                                onChange={(e) => setEndDate(e.target.value)}
                            />
                        </div>
                    )}
                </div>
                {((isOneDay && startDate) || (!isOneDay && startDate && endDate)) &&
                    schedules.map((schedule, index) => (
                        <div key={index} className={styles.daySchedule}>
                            <p className={styles.date}>{schedule.date}</p>
                            <div className={styles.timePickerGroup}>
                                <div className={styles.pickers}>
                                    出発時間
                                    <div className={styles.pickersBlock}>
                                        <WheelPicker
                                            data={hours}
                                            defaultSelection={hours.indexOf(schedule.startTime.split(':')[0])}
                                            onChange={(value) =>
                                                handleTimeChange(
                                                    index,
                                                    'start',
                                                    `${value}:${schedule.startTime.split(':')[1]}`,
                                                )
                                            }
                                        />
                                        <p>-</p>
                                        <WheelPicker
                                            data={minutes}
                                            defaultSelection={minutes.indexOf(schedule.startTime.split(':')[1])}
                                            onChange={(value) =>
                                                handleTimeChange(
                                                    index,
                                                    'start',
                                                    `${schedule.startTime.split(':')[0]}:${value}`,
                                                )
                                            }
                                        />
                                    </div>
                                </div>
                                <span>～</span>
                                <div className={styles.pickers}>
                                    終了時間
                                    <div className={styles.pickersBlock}>
                                        <WheelPicker
                                            data={hours}
                                            defaultSelection={hours.indexOf(schedule.endTime.split(':')[0])}
                                            onChange={(value) =>
                                                handleTimeChange(
                                                    index,
                                                    'end',
                                                    `${value}:${schedule.endTime.split(':')[1]}`,
                                                )
                                            }
                                        />
                                        <p>-</p>
                                        <WheelPicker
                                            data={minutes}
                                            defaultSelection={minutes.indexOf(schedule.endTime.split(':')[1])}
                                            onChange={(value) =>
                                                handleTimeChange(
                                                    index,
                                                    'end',
                                                    `${schedule.endTime.split(':')[0]}:${value}`,
                                                )
                                            }
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                <div className={styles.btnBox}>
                    <button onClick={handleSubmit} className={styles.submitButton}>
                        次に進む
                    </button>
                </div>
            </div>
            <Footer />
        </>
    );
}
