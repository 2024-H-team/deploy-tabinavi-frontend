import apiClient from '@/lib/axios';
import { BestRoute } from '@/types/TransferData';

export const findNearestStation = async (
    location: google.maps.LatLngLiteral,
    types: string[],
): Promise<google.maps.places.PlaceResult | null> => {
    const placesService = new window.google.maps.places.PlacesService(document.createElement('div'));
    const isBusStation = (name: string) => {
        const busKeywords = ['バス', 'bus', 'バス停', 'バスターミナル'];
        return busKeywords.some((keyword) => name.toLowerCase().includes(keyword.toLowerCase()));
    };

    const isTrainStation = (name: string) => {
        return name.endsWith('駅');
    };

    for (const type of types) {
        try {
            const result = await new Promise<google.maps.places.PlaceResult | null>((resolve, reject) => {
                placesService.nearbySearch(
                    {
                        location,
                        radius: 1500,
                        type: type as string,
                    },
                    (results, status) => {
                        if (status === google.maps.places.PlacesServiceStatus.OK && results?.length) {
                            const nonBusStations = results.filter((place) => !isBusStation(place.name || ''));
                            const trainStation = nonBusStations.find((place) => isTrainStation(place.name || ''));
                            resolve(trainStation || nonBusStations[0]);
                        } else {
                            reject(null);
                        }
                    },
                );
            });
            if (result) return result;
        } catch {}
    }
    return null;
};

export const calculateWalkingToNearestStation = async (
    origin: google.maps.LatLngLiteral,
    destination: google.maps.LatLngLiteral,
    setDuration: (duration: string) => void,
    setTransferData: (data: BestRoute | null) => void,
    setLoading: (loading: boolean) => void,
) => {
    setLoading(true);
    const directionsService = new window.google.maps.DirectionsService();
    const stationTypes = ['transit_station', 'subway_station', 'train_station'];

    try {
        const nearestOriginStation = await findNearestStation(origin, stationTypes);
        const nearestDestinationStation = await findNearestStation(destination, stationTypes);

        if (!nearestOriginStation || !nearestDestinationStation) {
            throw new Error();
        }

        const walkingToOriginStation = await new Promise<google.maps.DirectionsResult>((resolve, reject) => {
            directionsService.route(
                {
                    origin,
                    destination: {
                        lat: nearestOriginStation.geometry?.location?.lat() || 0,
                        lng: nearestOriginStation.geometry?.location?.lng() || 0,
                    },
                    travelMode: google.maps.TravelMode.WALKING,
                },
                (response, status) => {
                    if (status === google.maps.DirectionsStatus.OK && response) resolve(response);
                    else reject(status || 'No response received');
                },
            );
        });

        const walkingDurationToOriginStation = walkingToOriginStation.routes[0].legs[0].duration?.value || 0;

        const walkingFromDestinationStation = await new Promise<google.maps.DirectionsResult>((resolve, reject) => {
            directionsService.route(
                {
                    origin: {
                        lat: nearestDestinationStation.geometry?.location?.lat() || 0,
                        lng: nearestDestinationStation.geometry?.location?.lng() || 0,
                    },
                    destination,
                    travelMode: google.maps.TravelMode.WALKING,
                },
                (response, status) => {
                    if (status === google.maps.DirectionsStatus.OK && response) resolve(response);
                    else reject(status || 'No response received');
                },
            );
        });

        const walkingDurationFromDestinationStation =
            walkingFromDestinationStation.routes[0].legs[0].duration?.value || 0;

        const startName = (nearestOriginStation.name || '').replace(/駅$/, '');
        const endName = (nearestDestinationStation.name || '').replace(/駅$/, '');

        const response = await apiClient.post('/route', {
            startStation: startName,
            endStation: endName,
        });

        const data: BestRoute = response.data;
        if (data.totalCost === 0) {
            throw new Error('No route found');
        }
        setTransferData(data);
        const totalTimeSeconds =
            walkingDurationToOriginStation + walkingDurationFromDestinationStation + data.totalCost * 60;
        const totalHours = Math.floor(totalTimeSeconds / 3600);
        const totalMinutes = Math.floor((totalTimeSeconds % 3600) / 60);

        if (totalHours > 0) setDuration(`${totalHours}時間${totalMinutes}分`);
        else setDuration(`${totalMinutes}分`);

        setLoading(false);
    } catch {
        setDuration('経路が見つかりません');
        setLoading(false);
    }
};

export const calculateRegularDuration = async (
    origin: google.maps.LatLngLiteral,
    destination: google.maps.LatLngLiteral,
    selectedMode: string,
    setDuration: (duration: string) => void,
    setLoading: (loading: boolean) => void,
) => {
    setLoading(true);
    const directionsService = new window.google.maps.DirectionsService();

    try {
        const result = await new Promise<google.maps.DirectionsResult>((resolve, reject) => {
            directionsService.route(
                {
                    origin,
                    destination,
                    travelMode: google.maps.TravelMode[selectedMode as keyof typeof google.maps.TravelMode],
                },
                (response, status) => {
                    if (status === google.maps.DirectionsStatus.OK && response) resolve(response);
                    else reject(status);
                },
            );
        });

        const durationText = result.routes[0].legs[0].duration?.text || 'N/A';
        setDuration(durationText);
        setLoading(false);
    } catch {
        setDuration('N/A');
        setLoading(false);
    }
};
