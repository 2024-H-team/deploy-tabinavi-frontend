import { DaySchedule } from '@/app/create-schedule/page';
import apiClient from '@/lib/axios';
import { useRouter } from 'next/navigation';

// Truncate title to a specified maximum length
export const truncateTitle = (title: string, maxLength: number = 10): string => {
    return title.length > maxLength ? `${title.slice(0, maxLength)}...` : title;
};

// Handle navigation back based on session storage
export const handleBack = (router: ReturnType<typeof useRouter>, sessionStorage: Storage) => {
    const profileEdit = sessionStorage.getItem('profileScheduleEdit');
    const editSchedules = sessionStorage.getItem('editSchedules');

    if (profileEdit) {
        sessionStorage.removeItem('profileScheduleEdit');
        sessionStorage.removeItem('editSchedules');
        sessionStorage.removeItem('schedules');
        router.push('/profile');
    } else if (editSchedules) {
        sessionStorage.removeItem('editSchedules');
        sessionStorage.removeItem('schedules');
        router.push('/home');
    } else {
        router.push('/create-schedule/select-spot');
    }
};

// Save schedule to the server
export const handleSaveSchedule = async (
    schedules: DaySchedule[],
    titleValue: string,
    router: ReturnType<typeof useRouter>,
    sessionStorage: Storage,
    setIsSaving: React.Dispatch<React.SetStateAction<boolean>>,
) => {
    try {
        setIsSaving(true);
        const scheduleId = schedules[0]?.SchedulesID;

        const formattedScheduleData = {
            title: titleValue,
            start_date: new Date(schedules[0].date).toISOString().split('T')[0],
            end_date: new Date(schedules[schedules.length - 1].date).toISOString().split('T')[0],
            schedules: JSON.stringify(schedules),
        };

        let response;
        if (scheduleId) {
            response = await apiClient.put(`/schedules/${scheduleId}`, formattedScheduleData);
            if (response.data.success) {
                alert('スケジュールが更新されました！自動でホーム画面に移動します。');
            }
        } else {
            response = await apiClient.post('/schedules/create', formattedScheduleData);
            if (response.data.success) {
                alert('スケジュールが保存されました！自動でホーム画面に移動します。');
            }
        }

        if (response.data.success) {
            sessionStorage.removeItem('schedules');
            sessionStorage.removeItem('editSchedules');
            router.push('/home');
        }
    } catch (error) {
        console.error('Save schedule error:', error);
        alert('スケジュールの保存に失敗しました。');
    } finally {
        setIsSaving(false);
    }
};

// Delete schedule from the server
export const handleDeleteSchedule = async (
    schedules: DaySchedule[],
    router: ReturnType<typeof useRouter>,
    sessionStorage: Storage,
) => {
    const scheduleId = schedules[0]?.SchedulesID;
    if (!scheduleId) return;

    if (confirm('このスケジュールを削除してもよろしいですか？')) {
        try {
            const response = await apiClient.delete(`/schedules/${scheduleId}`);
            if (response.data.success) {
                alert('スケジュールが削除されました。');
                handleBack(router, sessionStorage);
            }
        } catch (error) {
            console.error('Delete schedule error:', error);
            alert('スケジュールの削除に失敗しました。');
        }
    }
};
