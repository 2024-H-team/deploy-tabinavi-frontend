// utils/createScheduleUtils.ts

import { useRouter } from 'next/navigation';
import apiClient from '@/lib/axios';
import { DaySchedule } from '@/app/create-schedule/page';
import { arrayMove } from '@dnd-kit/sortable';
import { searchNearbyPlaces } from '@/utils/mapCalculations';
import { PlaceDetails } from '@/types/PlaceDetails';
// Save schedules to session storage
export const saveToSessionStorage = (schedules: DaySchedule[]) => {
    sessionStorage.setItem('schedules', JSON.stringify(schedules));
};

// Add a new spot to the current day's schedule
export const handleAddSpot = (
    schedules: DaySchedule[],
    setSchedules: React.Dispatch<React.SetStateAction<DaySchedule[]>>,
    activeDateIndex: number,
    spot: PlaceDetails,
    setShowNotification: React.Dispatch<React.SetStateAction<boolean>>,
) => {
    const newSchedules = [...schedules];
    const currentDay = { ...newSchedules[activeDateIndex] };
    currentDay.spots = [...currentDay.spots, spot];
    newSchedules[activeDateIndex] = currentDay;
    sessionStorage.setItem('schedules', JSON.stringify(newSchedules));
    setSchedules(newSchedules);

    setShowNotification(true);
    setTimeout(() => {
        setShowNotification(false);
    }, 1000);
};

// Delete a spot from the current day's schedule
export const handleDeleteSpot = (
    schedules: DaySchedule[],
    setSchedules: React.Dispatch<React.SetStateAction<DaySchedule[]>>,
    activeDateIndex: number,
    index: number,
) => {
    const newSchedules = [...schedules];
    const currentDay = { ...newSchedules[activeDateIndex] };
    currentDay.spots = currentDay.spots.filter((_, i) => i !== index);
    newSchedules[activeDateIndex] = currentDay;
    sessionStorage.setItem('schedules', JSON.stringify(newSchedules));
    setSchedules(newSchedules);
};

// Reorder spots within the current day's schedule
export const handleReorderSpots = (
    schedules: DaySchedule[],
    setSchedules: React.Dispatch<React.SetStateAction<DaySchedule[]>>,
    activeDateIndex: number,
    oldIndex: number,
    newIndex: number,
) => {
    const newSchedules = [...schedules];
    const currentDay = { ...newSchedules[activeDateIndex] };
    currentDay.spots = arrayMove(currentDay.spots, oldIndex, newIndex);
    newSchedules[activeDateIndex] = currentDay;
    setSchedules(newSchedules);
};

// Handle recommendation click to fetch recommended spots
export const handleRecommendClick = async (
    schedules: DaySchedule[],
    activeDateIndex: number,
    setRecommendedSpots: React.Dispatch<React.SetStateAction<PlaceDetails[]>>,
    setVisibleRecommendedSpots: React.Dispatch<React.SetStateAction<PlaceDetails[]>>,
    setShowRecommendations: React.Dispatch<React.SetStateAction<boolean>>,
    setIsLoading: React.Dispatch<React.SetStateAction<boolean>>,
) => {
    if (schedules[activeDateIndex]?.spots.length === 0) {
        alert('少なくとも1つの場所を選択してください');
        return;
    }
    setIsLoading(true);
    try {
        const processedSpots = schedules[activeDateIndex].spots.reduce(
            (acc: { type: string; count: number }[], spot) => {
                const type = spot.primaryType;
                if (!type) return acc;
                const existing = acc.find((item) => item.type === type);
                if (existing) {
                    existing.count++;
                } else {
                    acc.push({ type, count: 1 });
                }
                return acc;
            },
            [],
        );

        const response = await apiClient.post('/recommended-place-types', {
            selectedPlaces: processedSpots,
        });

        if (response.data.success) {
            const nearbyPlaces = await searchNearbyPlaces(schedules[activeDateIndex].spots, response.data.data);
            setRecommendedSpots(nearbyPlaces || []);
            setVisibleRecommendedSpots(nearbyPlaces?.slice(0, 5) || []);
            setShowRecommendations(true);
        }
    } catch (error) {
        console.error('Error getting recommendations:', error);
    } finally {
        setIsLoading(false);
    }
};

// Create schedule by saving to session storage and navigating to preview
export const handleCreateSchedule = (schedules: DaySchedule[], router: ReturnType<typeof useRouter>) => {
    sessionStorage.setItem('schedules', JSON.stringify(schedules));

    const editSchedules = sessionStorage.getItem('editSchedules');
    if (editSchedules) {
        sessionStorage.setItem('editSchedules', JSON.stringify(schedules));
    }

    router.push('/create-schedule/schedule-preview');
};

// Update stay time for a spot
export const handleStayTimeUpdate = (
    schedules: DaySchedule[],
    setSchedules: React.Dispatch<React.SetStateAction<DaySchedule[]>>,
    activeDateIndex: number,
    spotName: string,
    stayTime: { hour: string; minute: string },
    stayTimeTimerRef: React.MutableRefObject<NodeJS.Timeout | null>,
) => {
    const newSchedules = [...schedules];
    const currentDay = { ...newSchedules[activeDateIndex] };
    const spotIndex = currentDay.spots.findIndex((s) => s.name === spotName);

    if (spotIndex !== -1) {
        currentDay.spots[spotIndex] = {
            ...currentDay.spots[spotIndex],
            stayTime,
        };
    }
    newSchedules[activeDateIndex] = currentDay;

    if (stayTimeTimerRef.current) {
        clearTimeout(stayTimeTimerRef.current);
    }

    stayTimeTimerRef.current = setTimeout(() => {
        sessionStorage.setItem('schedules', JSON.stringify(newSchedules));
    }, 300);

    setSchedules(newSchedules);
};
