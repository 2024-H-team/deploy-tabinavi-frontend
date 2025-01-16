import { PlaceDetails } from '@/types/PlaceDetails';

export const calculateDistance = (point1: google.maps.LatLngLiteral, point2: google.maps.LatLngLiteral): number => {
    return google.maps.geometry.spherical.computeDistanceBetween(
        new google.maps.LatLng(point1),
        new google.maps.LatLng(point2),
    );
};

export const findCenterPoint = (
    point1: google.maps.LatLngLiteral,
    point2: google.maps.LatLngLiteral,
): google.maps.LatLngLiteral => {
    return {
        lat: (point1.lat + point2.lat) / 2,
        lng: (point1.lng + point2.lng) / 2,
    };
};

export const searchNearbyPlaces = async (selectedSpots: PlaceDetails[], types: string[]) => {
    if (!selectedSpots.length) return;

    let centerLocation: google.maps.LatLngLiteral;
    let searchRadius: number;

    if (selectedSpots.length === 1) {
        centerLocation = selectedSpots[0].location;
        searchRadius = 1500;
    } else {
        let maxDistance = 0;
        let farthestPoints: [google.maps.LatLngLiteral, google.maps.LatLngLiteral] = [
            selectedSpots[0].location,
            selectedSpots[0].location,
        ];

        for (let i = 0; i < selectedSpots.length; i++) {
            for (let j = i + 1; j < selectedSpots.length; j++) {
                const distance = calculateDistance(selectedSpots[i].location, selectedSpots[j].location);
                if (distance > maxDistance) {
                    maxDistance = distance;
                    farthestPoints = [selectedSpots[i].location, selectedSpots[j].location];
                }
            }
        }

        centerLocation = findCenterPoint(farthestPoints[0], farthestPoints[1]);
        searchRadius = maxDistance / 2 + 3000;
    }

    const service = new google.maps.places.PlacesService(document.createElement('div'));

    const searchPromises = types.map(
        (type) =>
            new Promise<PlaceDetails[]>((resolve) => {
                service.nearbySearch(
                    {
                        location: centerLocation,
                        radius: searchRadius,
                        type: type,
                    },
                    (results, status) => {
                        if (status === google.maps.places.PlacesServiceStatus.OK && results) {
                            const detailsPromises = results.slice(0, 5).map(
                                (place) =>
                                    new Promise<PlaceDetails>((resolveDetails) => {
                                        service.getDetails(
                                            {
                                                placeId: place.place_id!,
                                                fields: [
                                                    'place_id',
                                                    'name',
                                                    'formatted_address',
                                                    'geometry',
                                                    'rating',
                                                    'photos',
                                                    'types',
                                                ],
                                            },
                                            (placeDetails, detailStatus) => {
                                                if (
                                                    detailStatus === google.maps.places.PlacesServiceStatus.OK &&
                                                    placeDetails
                                                ) {
                                                    resolveDetails({
                                                        placeId: placeDetails.place_id || '',
                                                        name: placeDetails.name || '',
                                                        address: placeDetails.formatted_address || '',
                                                        location: {
                                                            lat: placeDetails.geometry?.location?.lat() || 0,
                                                            lng: placeDetails.geometry?.location?.lng() || 0,
                                                        },
                                                        rating: placeDetails.rating,
                                                        types: placeDetails.types,
                                                        photos: placeDetails.photos,
                                                    });
                                                } else {
                                                    resolveDetails({} as PlaceDetails);
                                                }
                                            },
                                        );
                                    }),
                            );
                            resolve(Promise.all(detailsPromises));
                        } else {
                            resolve([]);
                        }
                    },
                );
            }),
    );

    const allResults = await Promise.all(searchPromises);
    const flatResults = allResults.flat();

    return Array.from(new Map(flatResults.map((place) => [place.placeId, place])).values());
};
