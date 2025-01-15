'use client';

import Styles from '@styles/componentStyles/create-schedule/CreateScheduleMap.module.scss';
import { useMemo, useRef, useState, useEffect } from 'react';
import { GoogleMap, Autocomplete } from '@react-google-maps/api';
import { PlaceDetails } from '@/types/PlaceDetails';
import { useMapContext } from '@/components/MapProvider';
import { smoothPanTo, createMarker, fetchPlaceDetailsFromLatLng, getPlaceDetails } from '@/utils/mapUtils';

interface CreateScheduleMapProps {
    onPlaceSelect: (places: PlaceDetails[]) => void;
    recommendedSpots?: PlaceDetails[];
    focusedSpot?: PlaceDetails | null;
    selectedSpots: PlaceDetails[];
}

const CreateScheduleMap: React.FC<CreateScheduleMapProps> = ({
    onPlaceSelect,
    recommendedSpots,
    focusedSpot,
    selectedSpots,
}) => {
    const { isLoaded, loadError } = useMapContext();
    const mapRef = useRef<google.maps.Map | null>(null);
    const autoCompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
    const [selectedPlaces, setSelectedPlaces] = useState<PlaceDetails[]>([]);
    const [clickedLocation, setClickedLocation] = useState<google.maps.LatLng | null>(null);

    const selectedMarkersRef = useRef<Map<string, google.maps.marker.AdvancedMarkerElement>>(new Map());
    const highlightMarkerRef = useRef<google.maps.marker.AdvancedMarkerElement | null>(null);

    const center = useMemo(() => ({ lat: 34.6937, lng: 135.5023 }), []);

    const [recommendMarkers, setRecommendMarkers] = useState<google.maps.marker.AdvancedMarkerElement[]>([]);

    const fitBoundsToMarkers = (map: google.maps.Map, markers: google.maps.marker.AdvancedMarkerElement[]) => {
        if (!markers.length) return;

        const bounds = new google.maps.LatLngBounds();
        markers.forEach((marker) => {
            if (marker.position) {
                bounds.extend(marker.position);
            }
        });

        map.fitBounds(bounds, 75);
    };

    useEffect(() => {
        if (!mapRef.current || !recommendedSpots?.length) {
            recommendMarkers.forEach((marker) => {
                marker.map = null;
            });
            setRecommendMarkers([]);
            return;
        }

        const createRecommendMarkers = async () => {
            recommendMarkers.forEach((marker) => {
                marker.map = null;
            });

            const newMarkers = await Promise.all(
                recommendedSpots.map(async (spot) => {
                    return createMarker(
                        mapRef.current!,
                        new google.maps.LatLng(spot.location.lat, spot.location.lng),
                        'blue',
                    );
                }),
            );

            setRecommendMarkers(newMarkers);
            fitBoundsToMarkers(mapRef.current!, newMarkers);
        };

        createRecommendMarkers();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [recommendedSpots]);

    useEffect(() => {
        if (!mapRef.current || !focusedSpot) return;

        const createHighlightMarker = async () => {
            const position = new google.maps.LatLng(focusedSpot.location.lat, focusedSpot.location.lng);

            smoothPanTo(mapRef.current, position);

            if (highlightMarkerRef.current) {
                highlightMarkerRef.current.map = null;
                highlightMarkerRef.current = null;
            }

            const newHighlightMarker = await createMarker(mapRef.current!, position, 'red');

            highlightMarkerRef.current = newHighlightMarker;

            if (mapRef.current) {
                const map = mapRef.current;
                const zoom = map.getZoom();
                if (typeof zoom === 'number' && zoom < 13) {
                    map.setZoom(13);
                }
            }
        };

        createHighlightMarker();
    }, [focusedSpot]);

    useEffect(() => {
        if (!clickedLocation || !mapRef.current) return;

        const initializeMarker = async () => {
            try {
                if (highlightMarkerRef.current) {
                    highlightMarkerRef.current.map = null;
                    highlightMarkerRef.current = null;
                }
                const newHighlightMarker = await createMarker(mapRef.current!, clickedLocation, 'red');
                highlightMarkerRef.current = newHighlightMarker;

                if (mapRef.current) {
                    const map = mapRef.current;
                    const zoom = map.getZoom();
                    if (typeof zoom === 'number' && zoom < 13) {
                        map.setZoom(13);
                    }
                }
                mapRef.current!.panTo(clickedLocation);
            } catch (error) {
                console.error('Error initializing AdvancedMarkerElement: ', error);
            }
        };

        initializeMarker();
    }, [clickedLocation]);

    useEffect(() => {
        if (!mapRef.current) return;

        const manageSelectedMarkers = async () => {
            const currentMarkers = selectedMarkersRef.current;
            const newSelectedSpotsIds = new Set(selectedSpots.map((spot) => spot.placeId));

            currentMarkers.forEach((marker, placeId) => {
                if (!newSelectedSpotsIds.has(placeId)) {
                    marker.map = null;
                    currentMarkers.delete(placeId);
                }
            });

            await Promise.all(
                selectedSpots.map(async (spot) => {
                    if (!currentMarkers.has(spot.placeId)) {
                        const position = new google.maps.LatLng(spot.location.lat, spot.location.lng);
                        const newMarker = await createMarker(mapRef.current!, position);
                        currentMarkers.set(spot.placeId, newMarker);
                    }
                }),
            );

            if (selectedSpots.length > 0 && mapRef.current) {
                const bounds = new google.maps.LatLngBounds();
                selectedSpots.forEach((spot) => {
                    bounds.extend(new google.maps.LatLng(spot.location.lat, spot.location.lng));
                });
                // mapRef.current.fitBounds(bounds, 75);
            }
        };

        manageSelectedMarkers();
    }, [selectedSpots]);

    const handlePlaceSelect = () => {
        if (autoCompleteRef.current) {
            const place = autoCompleteRef.current.getPlace();

            if (place && place.geometry && place.geometry.location) {
                const location = place.geometry.location;
                smoothPanTo(mapRef.current, location);

                const service = new google.maps.places.PlacesService(mapRef.current!);
                getPlaceDetails(service, place.place_id!).then((placeDetails) => {
                    if (placeDetails) {
                        setClickedLocation(location);
                        setSelectedPlaces([placeDetails]);
                        onPlaceSelect([placeDetails]);
                    }
                });
            }
        }
    };

    const handleMapClick = (e: google.maps.MapMouseEvent) => {
        const latLng = e.latLng;
        if (!latLng || !mapRef.current) return;

        if ('placeId' in e && e.placeId) {
            e.stop?.();

            const service = new google.maps.places.PlacesService(mapRef.current);
            getPlaceDetails(service, e.placeId as string).then((place) => {
                if (place) {
                    smoothPanTo(mapRef.current, latLng);
                    setClickedLocation(latLng);
                    setSelectedPlaces([place]);
                    onPlaceSelect([place]);
                }
            });
        } else {
            fetchPlaceDetailsFromLatLng(mapRef.current, latLng, {
                onLocationSet: setClickedLocation,
                onPlacesFound: (places) => {
                    setSelectedPlaces(places);
                    onPlaceSelect(places);
                },
            });
        }
    };

    if (loadError) return <div>Error loading maps</div>;
    if (!isLoaded) return <div>Loading...</div>;

    return (
        <>
            <style>{`
                .gm-style-iw { display: none!important; }
                .gm-style-iw-tc { display: none!important; }
                .gm-fullscreen-control { display: none!important; }
                .gm-svpc { display: none!important; }
                .gmnoprint { display: none!important; }
            `}</style>
            <div className={Styles.map}>
                <Autocomplete
                    onLoad={(autocomplete) => (autoCompleteRef.current = autocomplete)}
                    onPlaceChanged={handlePlaceSelect}
                    className={Styles.searchBox}
                >
                    <div className={Styles.searchContainer}>
                        <input type="text" placeholder="検索" />
                    </div>
                </Autocomplete>

                <GoogleMap
                    center={selectedPlaces[0]?.location || center}
                    zoom={10}
                    mapContainerClassName={Styles.mapContainer}
                    mapContainerStyle={{ width: '100%', height: '100%' }}
                    onLoad={(map) => {
                        mapRef.current = map;
                        map.setOptions({
                            mapId: '26a4732fc7efb60',
                            gestureHandling: 'greedy',
                        });
                    }}
                    onClick={handleMapClick}
                    options={{
                        gestureHandling: 'greedy',
                    }}
                />
            </div>
        </>
    );
};

export default CreateScheduleMap;
