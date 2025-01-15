'use client';

import React, { createContext, useContext } from 'react';
import { useJsApiLoader } from '@react-google-maps/api';
import { extendedLibraries } from '@/utils/googleMapConfig';

interface MapContextProps {
    isLoaded: boolean;
    loadError: Error | undefined;
}

const MapContext = createContext<MapContextProps | undefined>(undefined);

export const MapProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { isLoaded, loadError } = useJsApiLoader({
        googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
        libraries: extendedLibraries,
        language: 'ja',
    });

    return <MapContext.Provider value={{ isLoaded, loadError }}>{children}</MapContext.Provider>;
};

export const useMapContext = () => {
    const context = useContext(MapContext);
    if (!context) {
        throw new Error('useMapContext must be used within a MapProvider');
    }
    return context;
};
