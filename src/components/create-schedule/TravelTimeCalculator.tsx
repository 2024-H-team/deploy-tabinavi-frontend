'use client';
import { useEffect, useState } from 'react';
import styles from '@styles/componentStyles/create-schedule/PreviewSpotItem.module.scss';
import { BestRoute } from '@/types/TransferData';
import { useRouter } from 'next/navigation';
import { TransportInfo } from '@/app/create-schedule/page';
import { calculateWalkingToNearestStation, calculateRegularDuration } from '@/utils/mapTransportCalculations';
import { GrNext } from 'react-icons/gr';

type TravelMode = 'WALKING' | 'DRIVING' | 'TRANSIT';

interface TravelTimeCalculatorProps {
    origin: google.maps.LatLngLiteral;
    destination: google.maps.LatLngLiteral;
    onTransportCalculated?: (transportInfo: TransportInfo) => void;
    transportInfo?: TransportInfo;
    setHasEdited?: (edited: boolean) => void;
}

export const TravelTimeCalculator: React.FC<TravelTimeCalculatorProps> = ({
    origin,
    destination,
    onTransportCalculated,
    transportInfo,
    setHasEdited,
}) => {
    const router = useRouter();
    const [selectedMode, setSelectedMode] = useState<TravelMode>(transportInfo?.mode || 'WALKING');
    const [duration, setDuration] = useState<string>('計算中');
    const [transferData, setTransferData] = useState<BestRoute | null>(null);
    const [isGoogleMapsReady, setGoogleMapsReady] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const interval = setInterval(() => {
            if (window.google && window.google.maps && typeof window.google.maps.DirectionsService === 'function') {
                setGoogleMapsReady(true);
                clearInterval(interval);
            }
        }, 300);
        if (!isGoogleMapsReady) return;

        if (selectedMode === 'TRANSIT') {
            calculateWalkingToNearestStation(origin, destination, setDuration, setTransferData, setLoading);
        } else {
            calculateRegularDuration(origin, destination, selectedMode, setDuration, setLoading);
        }
    }, [origin, destination, selectedMode, isGoogleMapsReady]);

    useEffect(() => {
        if (!loading && duration !== '計算中' && duration !== 'N/A') {
            onTransportCalculated?.({
                mode: selectedMode,
                duration,
                routeDetail: transferData || undefined,
            });
        }
    }, [loading, duration, selectedMode, transferData, onTransportCalculated]);

    const handleDurationClick = () => {
        if (transferData) {
            sessionStorage.setItem('transferData', JSON.stringify(transferData));
            router.push('/create-schedule/schedule-preview/transfer');
        }
    };

    const handleModeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedMode(e.target.value as TravelMode);
        setHasEdited?.(true);
        sessionStorage.removeItem('noneEdit');
    };

    return (
        <div className={styles.travelTimeCalculator}>
            <select value={selectedMode} onChange={handleModeChange} className={styles.modeSelect}>
                <option value="WALKING">徒歩</option>
                <option value="DRIVING">車</option>
                <option value="TRANSIT">電車</option>
            </select>
            {loading ? (
                <p className={styles.duration}>計算中...</p>
            ) : (
                <p className={styles.duration}>
                    {duration}
                    {selectedMode === 'TRANSIT' && transferData && (
                        <span onClick={handleDurationClick} className={styles.transferDetail}>
                            <GrNext />
                        </span>
                    )}
                </p>
            )}
        </div>
    );
};
