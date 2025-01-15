'use client';
import { useState, useRef, TouchEvent } from 'react';
import Image from 'next/image';
import styles from '@styles/componentStyles/create-schedule/SpotInfo.module.scss';
import { PlaceDetails } from '@/types/PlaceDetails';
import { CiShare1, CiBookmark } from 'react-icons/ci';

interface SpotInfoProps {
    places: PlaceDetails[];
    onAddSpot: (spot: PlaceDetails) => void;
    onClose: () => void;
}

export default function SpotInfo({ places, onAddSpot, onClose }: SpotInfoProps) {
    const [currentTop, setCurrentTop] = useState('60');
    const [startY, setStartY] = useState(0);
    const [dragging, setDragging] = useState(false);
    const dragThreshold = 10;
    const containerRef = useRef<HTMLDivElement>(null);

    if (!places.length) {
        return (
            <div className={styles.noPlace}>
                <p>場所が選択されていません。地図上で場所を選択してください。</p>
            </div>
        );
    }

    const place = places[0];
    const hasPhotos = place.photos?.length || place.photoUrls?.length;

    const onTouchStart = (e: TouchEvent<HTMLDivElement>) => {
        setStartY(e.touches[0].clientY);
        setDragging(true);
    };

    const onTouchMove = (e: TouchEvent<HTMLDivElement>) => {
        if (!dragging || !containerRef.current) return;
        const diff = startY - e.touches[0].clientY;
        if (Math.abs(diff) <= dragThreshold) return;

        const newTop = Number(currentTop) - (diff / window.innerHeight) * 100;
        const isPullingDownFromTop5 = Number(currentTop) === 5 && diff < 0;

        // If at top=5 and pulling down, only move if scrollTop=0
        if (isPullingDownFromTop5) {
            if (containerRef.current.scrollTop > 0) return; // let content scroll
        }

        if (newTop < 5) {
            setCurrentTop('5');
        } else if (newTop > 60) {
            setCurrentTop('60');
        } else {
            setCurrentTop(String(newTop));
        }
    };

    const onTouchEnd = () => {
        setDragging(false);
        const t = Number(currentTop);
        if (t < 30) {
            setCurrentTop('5');
        } else {
            setCurrentTop('60');
        }
    };

    const isOpenNow = (openingHours?: PlaceDetails['openingHours']): boolean => {
        if (!openingHours?.periods) return false;

        const now = new Date();
        const currentDay = now.getDay();
        const currentHours = now.getHours();
        const currentMinutes = now.getMinutes();
        const currentTotalMinutes = currentHours * 60 + currentMinutes;

        return openingHours.periods.some((period) => {
            // Case 1: 24-hour operation
            if (
                !period.close ||
                (period.open.hours === 0 &&
                    period.open.minutes === 0 &&
                    (!period.close || (period.close.hours === 0 && period.close.minutes === 0)))
            ) {
                return true;
            }

            const openDay = period.open.day;
            const closeDay = period.close?.day || openDay;
            const openTotalMinutes = period.open.hours * 60 + period.open.minutes;
            const closeTotalMinutes = period.close ? period.close.hours * 60 + period.close.minutes : openTotalMinutes;

            // Case 2: Same day operation
            if (openDay === closeDay && currentDay === openDay) {
                return currentTotalMinutes >= openTotalMinutes && currentTotalMinutes < closeTotalMinutes;
            }

            // Case 3: Overnight operation
            if (closeDay !== openDay) {
                if (currentDay === openDay) {
                    return currentTotalMinutes >= openTotalMinutes;
                }
                if (currentDay === closeDay) {
                    return currentTotalMinutes < closeTotalMinutes;
                }
            }

            return false;
        });
    };
    const handleAddSpot = (place: PlaceDetails) => {
        onAddSpot(place);
        setCurrentTop('60');
        if (containerRef.current) {
            containerRef.current.scrollTop = 0;
        }
    };
    return (
        <div
            ref={containerRef}
            className={styles.spotInfoContainer}
            style={{ top: `${currentTop}%` }}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
        >
            <div className={styles.content}>
                <div className={styles.header}>
                    <div className={styles.iconBox}>
                        <div className={styles.closeBtn}>
                            <CiBookmark />
                        </div>
                        <div className={styles.closeBtn}>
                            <CiShare1 />
                        </div>
                        <div className={styles.closeBtn} onClick={onClose}>
                            ✕
                        </div>
                    </div>
                    <div className={styles.dragBar}></div>
                    <p className={styles.name}>{place.name || '名称不明'}</p>
                    <div className={styles.bar}></div>
                    {place.rating !== undefined && (
                        <div className={styles.rating}>
                            <span>{place.rating.toFixed(1)}</span>
                            <span style={{ color: '#FFD700', marginLeft: '4px' }}>⭐</span>
                        </div>
                    )}
                    {place.address && <p className={styles.address}>{place.address}</p>}
                    {place.openingHours && (
                        <p className={isOpenNow(place.openingHours) ? styles.openStatus : styles.closedStatus}>
                            {isOpenNow(place.openingHours) ? '営業中' : '営業時間外'}
                        </p>
                    )}
                </div>
                {hasPhotos ? (
                    <div className={styles.photoRow}>
                        {(place.photos?.slice(0, 3) || place.photoUrls?.slice(0, 3) || []).map(
                            (photo: google.maps.places.PlacePhoto | string, idx: number) => {
                                const url =
                                    typeof photo === 'string'
                                        ? photo
                                        : photo.getUrl
                                        ? photo.getUrl({ maxWidth: 600, maxHeight: 600 })
                                        : '';
                                return (
                                    <div key={idx} className={styles.photoItem}>
                                        {url && <Image src={url} alt={`photo-${idx}`} width={600} height={600} />}
                                    </div>
                                );
                            },
                        )}
                    </div>
                ) : (
                    <div className={styles.photoRow}>
                        <p>画像がございません</p>
                    </div>
                )}
                <div className={styles.detailCard}>
                    <div className={styles.detailRow}>
                        <div className={styles.detailLabel}>営業時間：</div>
                        <div className={styles.detailValue}>
                            {place.openingHours?.weekday_text ? (
                                <ul className={styles.weekdayList}>
                                    {place.openingHours.weekday_text.map((day, index) => (
                                        <li key={index}>{day}</li>
                                    ))}
                                </ul>
                            ) : (
                                <p>情報なし</p>
                            )}
                        </div>
                    </div>
                    <div className={styles.bar}></div>
                    <div className={styles.detailRow}>
                        <div className={styles.detailLabel}>電話番号</div>
                        <div className={styles.detailValue}>
                            {place.phoneNumber || place.formattedPhoneNumber || '情報なし'}
                        </div>
                    </div>
                    <div className={styles.bar}></div>
                    <div className={styles.detailRow}>
                        <div className={styles.detailLabel}>Webサイト</div>
                        <div className={styles.detailValue}>
                            {place.website ? (
                                <a href={place.website} target="_blank" rel="noopener noreferrer">
                                    {place.website}
                                </a>
                            ) : (
                                '情報なし'
                            )}
                        </div>
                    </div>
                    <div className={styles.bar}></div>
                    <div className={styles.detailRow}>
                        <div className={styles.detailLabel}>住所</div>
                        <div className={styles.detailValue}>
                            {place.formattedAddress || place.address || '情報なし'}
                        </div>
                    </div>
                </div>
                <button className={styles.addButton} onClick={() => handleAddSpot(place)}>
                    行き先を追加する
                </button>
            </div>
        </div>
    );
}
