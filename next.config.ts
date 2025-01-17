import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
    sassOptions: {
        silenceDeprecations: ['legacy-js-api'],
    },
    images: {
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
