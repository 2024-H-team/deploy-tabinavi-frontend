import { HiOutlineTrash } from 'react-icons/hi';
import styles from '@styles/componentStyles/edit/DeleteSchedule.module.scss';
import { useRouter } from 'next/navigation';
import { DaySchedule } from '@/app/create-schedule/page';

export default function DeleteSchedule() {
    const router = useRouter();

    const handleDelete = () => {
        if (!confirm('このスポットを削除してもよろしいですか？')) {
            return;
        }

        const editSpot = JSON.parse(sessionStorage.getItem('editSpot') || '{}');
        const schedules: DaySchedule[] = JSON.parse(sessionStorage.getItem('schedules') || '[]');

        const updatedSchedules = schedules.map((schedule) => ({
            ...schedule,
            spots: schedule.spots.filter((spot) => spot.placeId !== editSpot.placeId),
        }));

        sessionStorage.setItem('schedules', JSON.stringify(updatedSchedules));
        sessionStorage.removeItem('editSpot');

        router.push('/create-schedule/schedule-preview');
    };

    return (
        <button className={styles.DeleteScheduleWrap} onClick={handleDelete}>
            <p>行き先を消去する</p>
            <HiOutlineTrash color="red" className={styles.TrashIcon} />
        </button>
    );
}
