import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
    sassOptions: {
        silenceDeprecations: ['legacy-js-api'],
    },
    images: {
        domains: ['maps.googleapis.com'],
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'maps.googleapis.com',
                port: '',
                pathname: '/maps/api/place/**',
            },
        ],
    },
};

export default nextConfig;
