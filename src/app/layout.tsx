import { Inter } from 'next/font/google';
import 'normalize.css';
import '@styles/GlobalStyles.scss';
import { MapProvider } from '@/components/MapProvider';

import { Metadata } from 'next';

export const generateMetadata = async (): Promise<Metadata> => {
    return {
        title: '旅ナビ',
        description: '情報収集の負担をAIで軽減できる旅行計画Webアプリ',
        applicationName: '旅ナビ',
        appleWebApp: {
            capable: true,
            title: '情報収集の負担をAIで軽減できる旅行計画Webアプリ',
            statusBarStyle: 'default',
        },
        icons: {
            icon: [
                {
                    rel: 'icon',
                    type: 'image/x-icon',
                    sizes: '48x48',
                    url: '/favicon.ico',
                },
                {
                    rel: 'icon',
                    type: 'image/png',
                    sizes: '16x16',
                    url: '/favicon-96x96.png',
                },
                {
                    rel: 'icon',
                    type: 'image/png',
                    sizes: '32x32',
                    url: '/favicon-96x96.png',
                },
                {
                    url: '/android-chrome-192x192.png',
                    sizes: '192x192',
                },
                {
                    url: '/android-chrome-512x512.png',
                    sizes: '512x512',
                },
            ],
            apple: '/apple-touch-icon.png',
        },
    };
};

const inter = Inter({
    subsets: ['latin'],
    weight: ['100', '300', '400', '500', '600', '700', '800', '900'],
    display: 'swap',
});

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className={inter.className}>
                <MapProvider>{children}</MapProvider>
            </body>
        </html>
    );
}
