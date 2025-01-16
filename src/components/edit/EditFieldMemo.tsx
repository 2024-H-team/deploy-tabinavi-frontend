import styles from '@styles/componentStyles/edit/Content.module.scss';
import { HiOutlinePencil } from 'react-icons/hi2';
import { useState, useRef, useEffect } from 'react';
import { DaySchedule } from '@/app/create-schedule/page';

type EditFieldMemoProps = {
    title: string;
    value: string | undefined;
    placeId: string;
};

export default function EditFieldMemo({ title, value, placeId }: EditFieldMemoProps) {
    const [isEditable, setIsEditable] = useState(false);
    const [inputValue, setInputValue] = useState(value || '');
    const inputRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        if (value !== undefined) {
            setInputValue(value);
        }
    }, [value]);

    const updateStorages = (newNote: string) => {
        // Update editSpot
        const editSpot = JSON.parse(sessionStorage.getItem('editSpot') || '{}');
        editSpot.note = newNote;
        sessionStorage.setItem('editSpot', JSON.stringify(editSpot));

        // Update schedules
        const schedules = JSON.parse(sessionStorage.getItem('schedules') || '[]');
        schedules.forEach((schedule: DaySchedule) => {
            schedule.spots = schedule.spots.map((s) => (s.placeId === placeId ? { ...s, note: newNote } : s));
        });
        sessionStorage.setItem('schedules', JSON.stringify(schedules));
        const editSchedules = sessionStorage.getItem('editSchedules');
        if (editSchedules) {
            sessionStorage.setItem('editSchedules', JSON.stringify(schedules));
        }
    };

    const handleEnableEdit = () => {
        setIsEditable(true);
        if (inputRef.current) {
            inputRef.current.focus();
            const length = inputRef.current.value.length;
            inputRef.current.setSelectionRange(length, length);
        }
    };

    const handleBlur = () => {
        setIsEditable(false);
        updateStorages(inputValue);
    };

    const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        setInputValue(event.target.value);
    };

    return (
        <div className={styles.EditWrap}>
            <div>
                <h2>{title}</h2>
                <textarea
                    ref={inputRef}
                    rows={5}
                    cols={30}
                    className={styles.EditMemo}
                    value={inputValue}
                    placeholder="お店の情報やURLを記入するのがおすすめ"
                    readOnly={!isEditable}
                    onBlur={handleBlur}
                    onChange={handleChange}
                    onClick={handleEnableEdit}
                />
            </div>
            <button className={styles.EditBtn} onClick={handleEnableEdit}>
                <HiOutlinePencil color="#929292" />
            </button>
        </div>
    );
}
