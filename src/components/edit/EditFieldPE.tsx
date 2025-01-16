import styles from '@styles/componentStyles/edit/Content.module.scss';
import { HiOutlinePencil } from 'react-icons/hi2';
import { MdClose } from 'react-icons/md';
import { useState, useEffect, useRef } from 'react';
import { DaySchedule } from '@/app/create-schedule/page';

type EditFieldPEProps = {
    title: string;
    data: { Name: string }[] | undefined;
};

export default function EditFieldPE({ title, data }: EditFieldPEProps) {
    const [personalEffects, setPersonalEffects] = useState(data || []);
    const [newItem, setNewItem] = useState('');
    const [isAdding, setIsAdding] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isAdding && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isAdding]);

    useEffect(() => {
        if (data) {
            setPersonalEffects(data);
        }
    }, [data]);

    const updateStorages = (newPackingList: { Name: string }[]) => {
        // Update editSpot
        const editSpot = JSON.parse(sessionStorage.getItem('editSpot') || '{}');
        editSpot.packingList = newPackingList.map((item) => item.Name);
        sessionStorage.setItem('editSpot', JSON.stringify(editSpot));

        const schedules = JSON.parse(sessionStorage.getItem('schedules') || '[]');
        schedules.forEach((schedule: DaySchedule) => {
            schedule.spots = schedule.spots.map((s) =>
                s.placeId === editSpot.placeId ? { ...s, packingList: newPackingList.map((item) => item.Name) } : s,
            );
        });
        sessionStorage.setItem('schedules', JSON.stringify(schedules));
        const editSchedules = sessionStorage.getItem('editSchedules');
        if (editSchedules) {
            sessionStorage.setItem('editSchedules', JSON.stringify(schedules));
        }
    };

    const handleDelete = (index: number) => {
        const newEffects = personalEffects.filter((_, i) => i !== index);
        setPersonalEffects(newEffects);
        updateStorages(newEffects);
    };

    const handleAdd = () => {
        if (newItem.trim()) {
            const newEffects = [...personalEffects, { Name: newItem }];
            setPersonalEffects(newEffects);
            setNewItem('');
            updateStorages(newEffects);
        }
    };

    const handleEditClick = () => {
        setIsAdding((prev) => !prev);
    };

    return (
        <div className={styles.EditWrap}>
            <div>
                <h2>{title}</h2>
                <div className={styles.PersonalEffectsWrap}>
                    {personalEffects.length > 0 ? (
                        personalEffects.map((effect, index) => (
                            <div key={index} className={styles.PersonalEffects}>
                                <p>
                                    {effect.Name}
                                    <button onClick={() => handleDelete(index)}>
                                        <MdClose size="12" />
                                    </button>
                                </p>
                            </div>
                        ))
                    ) : (
                        <p className={styles.NoItems}>持ち物がありません</p>
                    )}
                </div>

                {isAdding && (
                    <div className={styles.AddItemForm}>
                        <input
                            ref={inputRef}
                            type="text"
                            value={newItem}
                            placeholder="持ち物を入力"
                            onChange={(e) => setNewItem(e.target.value)}
                            className={styles.AddItemInput}
                        />
                        <button onClick={handleAdd} className={styles.AddButton}>
                            追加
                        </button>
                    </div>
                )}
            </div>
            <button className={styles.EditBtn} onClick={handleEditClick}>
                {isAdding ? 'キャンセル' : <HiOutlinePencil color="#929292" />}
            </button>
        </div>
    );
}
