'use client';
import React from 'react';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import styles from '@styles/componentStyles/create-schedule/SelectedSpotsContainer.module.scss';
import SortableSpotWrapper from '@/components/SortableSpotWrapper';
import { handleDragStart, handleDragEnd as handleDragEndUtil } from '@/utils/dragHandlers';
import { DaySchedule } from '@/app/create-schedule/page';
import SelectedSpot from './SelectedSpot';

interface SelectedSpotsContainerProps {
    schedules: DaySchedule[];
    activeDateIndex: number;
    onDateChange: (index: number) => void;
    onDeleteSpot: (index: number) => void;
    onReorderSpots: (oldIndex: number, newIndex: number) => void;
    isOpen: boolean;
    onClose: () => void;
    onStayTimeUpdate: (spotName: string, stayTime: { hour: string; minute: string }) => void;
}

export default function SelectedSpotsContainer({
    schedules,
    activeDateIndex,
    onDateChange,
    onDeleteSpot,
    onReorderSpots,
    isOpen,
    onClose,
    onStayTimeUpdate,
}: SelectedSpotsContainerProps) {
    const spots = schedules[activeDateIndex]?.spots || [];

    const getDateRange = () => {
        if (!schedules || schedules.length === 0) return 'No dates';
        const startDate = new Date(schedules[0].date).toLocaleDateString('ja-JP');
        const endDate = new Date(schedules[schedules.length - 1].date).toLocaleDateString('ja-JP');
        return `${startDate} - ${endDate}`;
    };

    const handlePrevDate = () => {
        if (activeDateIndex > 0) {
            onDateChange(activeDateIndex - 1);
        }
    };

    const handleNextDate = () => {
        if (activeDateIndex < schedules.length - 1) {
            onDateChange(activeDateIndex + 1);
        }
    };

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                delay: 100,
                tolerance: 5,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        }),
    );

    const handleDragEnd = (event: DragEndEvent) => {
        handleDragEndUtil();
        const { active, over } = event;
        if (active.id !== over?.id) {
            const oldIndex = spots.findIndex((spot) => spot.name === active.id);
            const newIndex = spots.findIndex((spot) => spot.name === over?.id);
            onReorderSpots(oldIndex, newIndex);
        }
    };

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
            onDragStart={handleDragStart}
        >
            <SortableContext items={spots.map((spot) => spot.name)}>
                <div className={`${styles.containerWrapper} ${isOpen ? styles.open : ''}`} onClick={onClose}>
                    <div
                        className={`${styles.Container} ${isOpen ? styles.open : ''}`}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className={styles.header}>
                            {getDateRange()}
                            <span className={styles.closeBtn} onClick={onClose}>
                                ✕
                            </span>
                        </div>
                        <div className={styles.datePageSelect}>
                            <span onClick={handlePrevDate}>≪</span>
                            <p className={styles.date}>
                                {new Date(schedules[activeDateIndex]?.date).toLocaleDateString('ja-JP')}
                            </p>
                            <span onClick={handleNextDate}>≫</span>
                        </div>
                        <div className={styles.content}>
                            {spots.map((spot, index) => (
                                <SortableSpotWrapper
                                    key={`${spot.name}-${index}`}
                                    spot={spot}
                                    onDelete={() => onDeleteSpot(index)}
                                    onStayTimeUpdate={onStayTimeUpdate}
                                    className={styles.selectedSpot}
                                >
                                    {({ dragHandleProps, isDragging }) => (
                                        <SelectedSpot
                                            spot={spot}
                                            onDelete={() => onDeleteSpot(index)}
                                            onStayTimeUpdate={onStayTimeUpdate}
                                            dragHandleProps={dragHandleProps}
                                            isDragging={isDragging}
                                        />
                                    )}
                                </SortableSpotWrapper>
                            ))}
                        </div>
                    </div>
                </div>
            </SortableContext>
        </DndContext>
    );
}
