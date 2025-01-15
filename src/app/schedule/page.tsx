'use client';

import { useState, useEffect } from 'react';
import ScheduleMap from '@/components/schedule/ScheduleMap';
import Styles from '@styles/appStyles/schedule/scheduleMap.module.scss';
import { useMapContext } from '@/components/MapProvider';
import { PlaceDetails } from '@/types/PlaceDetails';

export default function Schedule() {
    const { isLoaded } = useMapContext();
    const [places, setPlaces] = useState<PlaceDetails[]>([]);
    const [travelModes, setTravelModes] = useState<google.maps.TravelMode[]>([]);

    useEffect(() => {
        if (!isLoaded) return;

        const storedPlaces = sessionStorage.getItem('ScheduleSpot');
        if (storedPlaces) {
            const parsedPlaces: PlaceDetails[] = JSON.parse(storedPlaces);
            setPlaces(parsedPlaces);
            const initialTravelModes = Array(parsedPlaces.length).fill(google.maps.TravelMode.WALKING);
            setTravelModes(initialTravelModes);
        }
    }, [isLoaded]);

    const handleTravelModeChange = (index: number, mode: google.maps.TravelMode) => {
        const updatedModes = [...travelModes];
        updatedModes[index] = mode;
        setTravelModes(updatedModes);
    };

    if (!isLoaded || places.length < 2) {
        return <div>Loading...</div>;
    }

    return (
        <div>
            <h1>hi</h1>
            <ScheduleMap places={places} travelModes={travelModes} />
            <div className={Styles.btnBoxContainer}>
                {places.map((place, index) => {
                    const nextPlace = index === places.length - 1 ? places[0] : places[index + 1];
                    return (
                        <div key={index} className={Styles.btnBox}>
                            <p className={Styles.routing}>
                                {place.name} → {nextPlace.name}
                            </p>
                            <button onClick={() => handleTravelModeChange(index, google.maps.TravelMode.BICYCLING)}>
                                自転車
                            </button>
                            <button onClick={() => handleTravelModeChange(index, google.maps.TravelMode.WALKING)}>
                                徒歩
                            </button>
                            <button onClick={() => handleTravelModeChange(index, google.maps.TravelMode.DRIVING)}>
                                車
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
