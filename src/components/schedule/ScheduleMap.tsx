'use client';

import { useEffect, useRef, useState } from 'react';
import { GoogleMap, Marker, InfoWindow, DirectionsRenderer } from '@react-google-maps/api';
import { PlaceDetails } from '@/types/PlaceDetails';
import Styles from '@styles/componentStyles/create-schedule/CreateScheduleMap.module.scss';
import { useMapContext } from '@/components/MapProvider';

interface ScheduleMapProps {
    places: PlaceDetails[];
    travelModes: google.maps.TravelMode[];
}

const ScheduleMap: React.FC<ScheduleMapProps> = ({ places, travelModes }) => {
    const { isLoaded, loadError } = useMapContext();
    const mapRef = useRef<google.maps.Map | null>(null);
    const [directionsSegments, setDirectionsSegments] = useState<google.maps.DirectionsResult[]>([]);
    const [selectedPlace, setSelectedPlace] = useState<PlaceDetails | null>(null);

    useEffect(() => {
        if (!isLoaded || places.length < 2) return;

        const fetchDirections = async () => {
            const directionsService = new google.maps.DirectionsService();
            const results: google.maps.DirectionsResult[] = [];

            for (let i = 0; i < places.length; i++) {
                const origin = places[i].location;
                const destination = i === places.length - 1 ? places[0].location : places[i + 1].location;
                const travelMode = travelModes[i] || google.maps.TravelMode.WALKING;

                // console.log(
                //     `Creating route from ${places[i].name} to ${
                //         i === places.length - 1 ? places[0].name : places[i + 1].name
                //     } with mode ${travelMode}`,
                // );

                const result = await new Promise<google.maps.DirectionsResult | null>((resolve) => {
                    directionsService.route(
                        {
                            origin,
                            destination,
                            travelMode,
                        },
                        (response, status) => {
                            if (status === google.maps.DirectionsStatus.OK && response) {
                                resolve(response);
                            } else if (status === google.maps.DirectionsStatus.ZERO_RESULTS) {
                                alert(
                                    `No route found from ${places[i].name} to ${
                                        places[i + 1]?.name || places[0].name
                                    } with mode ${travelMode}`,
                                );
                                resolve(null);
                            } else {
                                console.error('Directions request failed due to ' + status);
                                resolve(null);
                            }
                        },
                    );
                });

                if (result) {
                    results.push(result);
                }
            }

            setDirectionsSegments(results);

            if (mapRef.current && places.length > 0) {
                const bounds = new google.maps.LatLngBounds();
                places.forEach((place) => {
                    if (place.location) {
                        bounds.extend(place.location);
                    }
                });
                mapRef.current.fitBounds(bounds);
            }
        };

        fetchDirections();
    }, [places, travelModes, isLoaded]);

    if (loadError) {
        return <div>Error loading maps</div>;
    }

    if (!isLoaded) return <div>Loading...</div>;

    const center = places[0]?.location || { lat: 34.6937, lng: 135.5023 };

    return (
        <div className={Styles.mapContainer}>
            <GoogleMap
                center={center}
                zoom={10}
                mapContainerClassName={Styles.mapContainer}
                mapContainerStyle={{ width: '100%', height: '100%' }}
                onLoad={(map) => {
                    mapRef.current = map;
                }}
            >
                {places.map((place, index) => (
                    <Marker
                        key={index}
                        position={place.location}
                        label={(index + 1).toString()}
                        title={place.name}
                        onClick={() => setSelectedPlace(place)}
                    />
                ))}

                {directionsSegments.map((directions, index) => (
                    <DirectionsRenderer key={index} directions={directions} options={{ suppressMarkers: true }} />
                ))}

                {selectedPlace && (
                    <InfoWindow position={selectedPlace.location} onCloseClick={() => setSelectedPlace(null)}>
                        <div>
                            <h4>{selectedPlace.name}</h4>
                            <p>{selectedPlace.address}</p>
                        </div>
                    </InfoWindow>
                )}
            </GoogleMap>
        </div>
    );
};

export default ScheduleMap;
