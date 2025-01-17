'use client';
import { useState, useEffect } from 'react';
import ScheduleView from '@/components/home/ScheduleView';
import styles from '@styles/appStyles/home/Home.module.scss';
import Footer from '@/components/Footer';
// import { IoSettingsOutline } from 'react-icons/io5';
import Calendar from '@/components/Calendar';
import apiClient from '@/lib/axios';

export default function Home() {
    const [schedules, setSchedules] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSchedules = async () => {
            try {
                const response = await apiClient.get('/schedules/list');
                if (response.data.success) {
                    setSchedules(response.data.data.schedules);
                }
            } catch (error) {
                console.error('Error fetching schedules:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchSchedules();
    }, []);
    if (loading) {
        return;
    }
    return (
        <>
            <div className={styles.ContentWrap}>
                <div className={styles.Setting}></div>
                <Calendar schedules={schedules} />
                <div className={styles.ScheduleWrap}>
                    <ScheduleView schedules={schedules} />
                </div>
            </div>
            <Footer />
        </>
    );
}
