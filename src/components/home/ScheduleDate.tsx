import React from 'react';
import styles from '@styles/componentStyles/home/ScheduleDate.module.scss';

interface ScheduleDateProps {
    data: {
        startDate: string;
        endDate: string;
    };
}

export default function ScheduleDate({ data }: ScheduleDateProps) {
    const getMonthAndDay = (date: string) => {
        const parsedDate = new Date(date);
        const month = parsedDate.getUTCMonth() + 1;
        const day = parsedDate.getUTCDate() + 1;
        return { month, day };
    };
    const start = getMonthAndDay(data.startDate);
    const end = getMonthAndDay(data.endDate);

    return (
        <div className={styles.DateWrap}>
            <p className={styles.Date}>
                {start.month}/<br />
                <span className={styles.day}>{start.day === end.day ? start.day : `${start.day}-${end.day}`}</span>
            </p>
        </div>
    );
}
