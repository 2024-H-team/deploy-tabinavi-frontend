// components/CreateSchedule.tsx

'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import Styles from '@styles/appStyles/schedule/CreateSchedule.module.scss';
import SpotInfo from '@/components/create-schedule/SpotInfo';
import { PlaceDetails } from '@/types/PlaceDetails';
import SelectedSpotsContainer from '@/components/create-schedule/SelectedSpotsContainer';
import RecommendSpotsContainer from '@/components/create-schedule/RecommendSpotsContainer';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { MdMenuOpen } from 'react-icons/md';
import { DaySchedule } from '@/app/create-schedule/page';

import {
    handleAddSpot,
    handleDeleteSpot,
    handleReorderSpots,
    handleRecommendClick,
    handleCreateSchedule,
    handleStayTimeUpdate,
} from '@/utils/createScheduleUtils';

const CreateScheduleMap = dynamic(() => import('@/components/create-schedule/CreateScheduleMap'), { ssr: false });

export default function CreateSchedule() {
    const router = useRouter();
    const [selectedPlaces, setSelectedPlaces] = useState<PlaceDetails[]>([]);
    const [recommendedSpots, setRecommendedSpots] = useState<PlaceDetails[]>([]);
    const [visibleRecommendedSpots, setVisibleRecommendedSpots] = useState<PlaceDetails[]>([]);
    const [focusedSpot, setFocusedSpot] = useState<PlaceDetails | null>(null);
    const [isContainerOpen, setIsContainerOpen] = useState(false);

    const [schedules, setSchedules] = useState<DaySchedule[]>([]);
    const [activeDateIndex, setActiveDateIndex] = useState<number>(0);
    const [showRecommendations, setShowRecommendations] = useState(false);
    const [recommendBtnBottom, setRecommendBtnBottom] = useState<number>(80);
    const recommendContainerRef = useRef<HTMLDivElement>(null);
    const [showNotification, setShowNotification] = useState(false);
    const [isRecommending, setIsRecommending] = useState(false);

    const stayTimeTimerRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        const saved = sessionStorage.getItem('schedules');
        if (!saved) {
            router.replace('/create-schedule');
            return;
        }
        setSchedules(JSON.parse(saved));
    }, [router]);

    useEffect(() => {
        if (showRecommendations && recommendContainerRef.current) {
            setRecommendBtnBottom(240);
        } else {
            setRecommendBtnBottom(80);
        }
    }, [showRecommendations]);

    const handleAddSpotCallback = useCallback(
        (spot: PlaceDetails) => {
            handleAddSpot(schedules, setSchedules, activeDateIndex, spot, setShowNotification);
        },
        [schedules, activeDateIndex],
    );

    const handleDeleteSpotCallback = useCallback(
        (index: number) => {
            handleDeleteSpot(schedules, setSchedules, activeDateIndex, index);
        },
        [schedules, activeDateIndex],
    );

    const handleReorderSpotsCallback = useCallback(
        (oldIndex: number, newIndex: number) => {
            handleReorderSpots(schedules, setSchedules, activeDateIndex, oldIndex, newIndex);
        },
        [schedules, activeDateIndex],
    );

    const handleRecommendClickCallback = useCallback(async () => {
        await handleRecommendClick(
            schedules,
            activeDateIndex,
            setRecommendedSpots,
            setVisibleRecommendedSpots,
            setShowRecommendations,
            setIsRecommending,
        );
    }, [schedules, activeDateIndex]);

    const handleCreateScheduleCallback = useCallback(() => {
        handleCreateSchedule(schedules, router);
    }, [schedules, router]);

    const handleStayTimeUpdateCallback = useCallback(
        (spotName: string, stayTime: { hour: string; minute: string }) => {
            handleStayTimeUpdate(schedules, setSchedules, activeDateIndex, spotName, stayTime, stayTimeTimerRef);
        },
        [schedules, activeDateIndex],
    );

    const handleCloseSpotInfo = useCallback(() => {
        setSelectedPlaces([]);
    }, []);

    const toggleContainer = () => {
        setIsContainerOpen(!isContainerOpen);
    };

    const handleCloseRecommendations = useCallback(() => {
        setShowRecommendations(false);
        setRecommendedSpots([]);
        setVisibleRecommendedSpots([]);
    }, []);

    const handleFocusSpot = useCallback((spot: PlaceDetails) => {
        setFocusedSpot(spot);
        setSelectedPlaces([spot]);
    }, []);

    const handleLoadMore = (visibleSpots: PlaceDetails[]) => {
        setVisibleRecommendedSpots(visibleSpots);
    };

    return (
        <div className={Styles.page}>
            <div className={Styles.mapContainer}>
                <CreateScheduleMap
                    onPlaceSelect={setSelectedPlaces}
                    recommendedSpots={visibleRecommendedSpots}
                    focusedSpot={focusedSpot}
                    selectedSpots={schedules[activeDateIndex]?.spots || []}
                />
            </div>
            {selectedPlaces.length > 0 && (
                <SpotInfo places={selectedPlaces} onAddSpot={handleAddSpotCallback} onClose={handleCloseSpotInfo} />
            )}
            {showRecommendations && (
                <div ref={recommendContainerRef}>
                    <RecommendSpotsContainer
                        recommendedSpots={recommendedSpots}
                        onLoadMore={handleLoadMore}
                        onFocusSpot={handleFocusSpot}
                        onClose={handleCloseRecommendations}
                    />
                </div>
            )}
            <div className={Styles.menuBtn} onClick={toggleContainer}>
                <MdMenuOpen color="white" size={30} />
                {schedules[activeDateIndex]?.spots.length > 0 && (
                    <div className={Styles.spotCountBox}>
                        <span className={Styles.spotCount}>{schedules[activeDateIndex]?.spots.length}</span>
                    </div>
                )}
            </div>
            <SelectedSpotsContainer
                schedules={schedules}
                activeDateIndex={activeDateIndex}
                onDateChange={setActiveDateIndex}
                onDeleteSpot={handleDeleteSpotCallback}
                onReorderSpots={handleReorderSpotsCallback}
                isOpen={isContainerOpen}
                onClose={() => setIsContainerOpen(false)}
                onStayTimeUpdate={handleStayTimeUpdateCallback}
            />
            <button
                onClick={handleRecommendClickCallback}
                className={Styles.recommendButton}
                style={{
                    bottom: `${recommendBtnBottom}px`,
                    transition: 'bottom 0.3s ease-in-out',
                }}
                disabled={isRecommending}
            >
                {isRecommending ? '送信中...' : 'AIにおすすめしてもらう'}
            </button>
            <div className={`${Styles.addSpotNotification} ${showNotification ? Styles.show : ''}`}>
                スポットを追加しました。
            </div>
            <div className={Styles.btnBox}>
                <Link className={Styles.backBtn} href={'/create-schedule'}>
                    戻る
                </Link>
                <button onClick={handleCreateScheduleCallback} className={Styles.submitBtn}>
                    スケジュール作成
                </button>
            </div>
        </div>
    );
}
