// PlaceDetails.ts
export interface PlaceDetails {
    name: string;
    address: string;
    phoneNumber?: string;
    website?: string;
    rating?: number;
    location: {
        lat: number;
        lng: number;
    };
    reviews?: google.maps.places.PlaceReview[];
    openingHours?: {
        weekday_text?: string[];
        periods?: {
            open: { day: number; hours: number; minutes: number };
            close: { day: number; hours: number; minutes: number };
        }[];
    };
    stayTime?: {
        hour: string;
        minute: string;
    };
    placeId: string;
    formattedPhoneNumber?: string;
    internationalPhoneNumber?: string;
    priceLevel?: number;
    photos?: google.maps.places.PlacePhoto[];
    photoUrls?: string[];
    types?: string[];
    vicinity?: string;
    businessStatus?: string;
    formattedAddress?: string;
    icon?: string;
    iconBackgroundColor?: string;
    iconMaskBaseUri?: string;
    primaryType?: string;
    userRatingsTotal?: number;
    packingList?: string[];
    note?: string;
}
