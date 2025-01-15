'use client';

import ScheduleDate from '@/components/home/ScheduleDate';
import styles from '@styles/componentStyles/home/ScheduleView.module.scss';
import { BiChevronRight } from 'react-icons/bi';
import { DaySchedule } from '@/app/create-schedule/page';
import { useRouter } from 'next/navigation';

interface Schedule {
    id?: number;
    title: string;
    start_date: string;
    end_date: string;
    schedules: DaySchedule[] | string;
}

interface ScheduleViewProps {
    schedules: Schedule[];
    viewAll?: boolean;
}

export default function ScheduleView({ schedules, viewAll = false }: ScheduleViewProps) {
    const router = useRouter();

    const parseSchedules = (scheduleData: DaySchedule[] | string): DaySchedule[] | null => {
        try {
            if (Array.isArray(scheduleData)) {
                return scheduleData;
            }
            if (typeof scheduleData === 'string') {
                return JSON.parse(scheduleData);
            }
            console.error('Invalid schedule format:', scheduleData);
            return null;
        } catch (error) {
            console.error('Failed to parse schedule:', error);
            return null;
        }
    };

    const sortedSchedules = schedules.sort((a, b) => {
        return (
            Math.abs(new Date(a.start_date).getTime() - new Date().getTime()) -
            Math.abs(new Date(b.start_date).getTime() - new Date().getTime())
        );
    });

    const displaySchedules = viewAll ? sortedSchedules : sortedSchedules.slice(0, 3);

    if (!displaySchedules.length) {
        return (
            <div style={{ textAlign: 'center', padding: '20px', color: '#666', fontSize: '14px' }}>
                スケジュールがございません。
            </div>
        );
    }

    const handleScheduleClick = (schedule: Schedule) => {
        const dailySchedules = parseSchedules(schedule.schedules);
        if (!dailySchedules) return;

        const editSchedules = dailySchedules.map((day) => ({
            SchedulesID: schedule.id,
            title: schedule.title,
            date: day.date,
            startTime: day.startTime,
            endTime: day.endTime,
            spots: day.spots,
            transports: day.transports || [],
        }));
        sessionStorage.setItem('editSchedules', JSON.stringify(editSchedules));
        sessionStorage.setItem('profileScheduleEdit', 'fromProfile');
        router.push('/create-schedule/schedule-preview');
    };
    const truncateTitle = (title: string, maxLength: number = 15) => {
        return title.length > maxLength ? `${title.slice(0, maxLength)}...` : title;
    };
    return (
        <>
            {sortedSchedules.map((schedule, index) => {
                const dailySchedules = parseSchedules(schedule.schedules);
                if (!dailySchedules) return null;

                const firstDay = dailySchedules[0];
                if (!firstDay) return null;

                return (
                    <div key={index} className={styles.ScheduleWrap} onClick={() => handleScheduleClick(schedule)}>
                        <div>
                            <ScheduleDate
                                data={{
                                    startDate: schedule.start_date,
                                    endDate: schedule.end_date,
                                }}
                            />
                        </div>

                        <div className={styles.ContentsWrap}>
                            <div className={styles.ScheduleContents}>
                                <p className={styles.time}>
                                    {firstDay.startTime}~{firstDay.endTime}
                                </p>
                                <h3>{truncateTitle(schedule.title)}</h3>
                            </div>
                            <div className={styles.BiChevronRight}>
                                <BiChevronRight size="30px" color="blue" />
                            </div>
                        </div>
                    </div>
                );
            })}
        </>
    );
}
